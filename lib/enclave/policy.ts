/**
 * In-enclave policy engine. Two jobs:
 *   buildRules  — at seal time, turn the sender's chosen conditions (+ secrets)
 *                 into verifiers that store NO plaintext secret (passphrases are
 *                 salted+hashed here, inside the enclave).
 *   evaluateRules — at unlock time, check the recipient's proofs against those
 *                 verifiers. Only if every rule passes is the key released.
 *
 * Self-contained rules (passphrase, expiry, download-limit, one-time, nda) are
 * checked with pure crypto/state. Wallet/token/nft rules are checked on-chain:
 * the recipient signs a vault-bound challenge to *prove* an address, then the
 * enclave reads Coston2 for token balance / NFT ownership of that address. This
 * is the enclave making a live on-chain access decision.
 */
import { bytesToHex } from "@/lib/crypto/bytes";
import {
  erc20BalanceOf,
  erc721BalanceOf,
  erc721OwnerOf,
  getAddress,
  isAddress,
  recoverMessageAddress,
  type Address,
} from "@/lib/chain/coston2";
import { unlockChallengeMessage } from "@/lib/enclave/challenge";
import type { ConditionKind } from "@/lib/constants";
import type { PolicyResult, PolicyRule, UnlockProofs } from "@/lib/enclave/types";

const PBKDF2_ITERATIONS = 100_000;

async function pbkdf2Hex(passphrase: string, salt: Uint8Array): Promise<string> {
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS },
    base,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

/** Timing-safe-ish comparison of two equal-length hex strings. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Build storable verifiers from the sender's conditions. `secrets` (e.g. the
 * passphrase) exist only here, in the enclave — the hash is stored, never the
 * secret. `now` is passed in so callers control the clock.
 */
export async function buildRules(
  conditions: { kind: ConditionKind; config?: Record<string, unknown> }[],
  secrets: { passphrase?: string },
  now: Date,
): Promise<PolicyRule[]> {
  const rules: PolicyRule[] = [];
  for (const c of conditions) {
    switch (c.kind) {
      case "passphrase": {
        if (!secrets.passphrase) break;
        const salt = crypto.getRandomValues(new Uint8Array(16));
        rules.push({
          kind: "passphrase",
          verifier: {
            salt: bytesToHex(salt),
            hash: await pbkdf2Hex(secrets.passphrase, salt),
          },
        });
        break;
      }
      case "expiry": {
        const days = Number(c.config?.days ?? 30);
        const deadline = new Date(now.getTime() + days * 86_400_000);
        rules.push({ kind: "expiry", verifier: { deadline: deadline.toISOString() } });
        break;
      }
      case "download-limit": {
        const max = Number(c.config?.max ?? 2);
        rules.push({ kind: "download-limit", verifier: { max } });
        break;
      }
      case "one-time":
        rules.push({ kind: "one-time" });
        break;
      case "nda":
        rules.push({ kind: "nda" });
        break;
      case "wallet": {
        const allow = (
          Array.isArray(c.config?.allow) ? (c.config!.allow as unknown[]) : []
        )
          .map((a) => String(a).trim().toLowerCase())
          .filter((a) => isAddress(a));
        rules.push({ kind: "wallet", verifier: { allow } });
        break;
      }
      case "token": {
        rules.push({
          kind: "token",
          verifier: {
            contract: String(c.config?.contract ?? "").trim(),
            minBaseUnits: String(c.config?.minBaseUnits ?? c.config?.min ?? "1"),
          },
        });
        break;
      }
      case "nft": {
        rules.push({
          kind: "nft",
          verifier: {
            contract: String(c.config?.contract ?? "").trim(),
            tokenId:
              c.config?.tokenId != null ? String(c.config.tokenId) : undefined,
          },
        });
        break;
      }
    }
  }
  return rules;
}

export interface EvalContext {
  vaultId: string;
  now: Date;
  /** Successful unlocks BEFORE this attempt (for limit / one-time). */
  unlockCount: number;
}

/**
 * Establish a cryptographically proven wallet address from the recipient's
 * signature over this vault's challenge. Returns null if absent or invalid.
 */
async function proveAddress(
  vaultId: string,
  proofs: UnlockProofs,
): Promise<Address | null> {
  if (
    !proofs.walletSignature ||
    !proofs.walletAddress ||
    !isAddress(proofs.walletAddress)
  ) {
    return null;
  }
  try {
    const recovered = await recoverMessageAddress({
      message: unlockChallengeMessage(vaultId),
      signature: proofs.walletSignature as `0x${string}`,
    });
    return getAddress(recovered) === getAddress(proofs.walletAddress)
      ? getAddress(proofs.walletAddress)
      : null;
  } catch {
    return null;
  }
}

export interface EvalOutcome {
  results: PolicyResult[];
  /** The cryptographically proven wallet address, if one was supplied. */
  provenAddress: Address | null;
}

/** Evaluate proofs against stored verifiers. Every rule must pass to grant. */
export async function evaluateRules(
  rules: PolicyRule[],
  proofs: UnlockProofs,
  ctx: EvalContext,
): Promise<EvalOutcome> {
  const needsWallet = rules.some((r) =>
    (["wallet", "token", "nft"] as ConditionKind[]).includes(r.kind),
  );
  const proven = needsWallet ? await proveAddress(ctx.vaultId, proofs) : null;

  const results: PolicyResult[] = [];
  for (const rule of rules) {
    switch (rule.kind) {
      case "passphrase": {
        const v = rule.verifier as { salt: string; hash: string } | undefined;
        const salt = v ? hexToBytes(v.salt) : new Uint8Array();
        const ok =
          !!proofs.passphrase &&
          !!v &&
          safeEqual(await pbkdf2Hex(proofs.passphrase, salt), v.hash);
        results.push(res("passphrase", ok, ok ? undefined : "Incorrect passphrase."));
        break;
      }
      case "expiry": {
        const deadline = new Date((rule.verifier as { deadline: string }).deadline);
        const ok = ctx.now.getTime() <= deadline.getTime();
        results.push(res("expiry", ok, ok ? undefined : "This vault has expired."));
        break;
      }
      case "download-limit": {
        const max = Number((rule.verifier as { max: number }).max);
        const ok = ctx.unlockCount < max;
        results.push(res("download-limit", ok, ok ? undefined : "Download limit reached."));
        break;
      }
      case "one-time": {
        const ok = ctx.unlockCount < 1;
        results.push(res("one-time", ok, ok ? undefined : "This one-time vault was already opened."));
        break;
      }
      case "nda": {
        const ok = proofs.ndaAccepted === true;
        results.push(res("nda", ok, ok ? undefined : "You must accept the NDA to continue."));
        break;
      }
      case "wallet": {
        if (!proven) {
          results.push(res("wallet", false, "Connect and sign with your wallet."));
          break;
        }
        const allow = (rule.verifier as { allow: string[] } | undefined)?.allow ?? [];
        const ok = allow.includes(proven.toLowerCase());
        results.push(res("wallet", ok, ok ? undefined : "This wallet isn't on the allow-list."));
        break;
      }
      case "token": {
        if (!proven) {
          results.push(res("token", false, "Connect and sign with your wallet."));
          break;
        }
        const v = rule.verifier as { contract: string; minBaseUnits: string };
        results.push(await evalToken(v, proven));
        break;
      }
      case "nft": {
        if (!proven) {
          results.push(res("nft", false, "Connect and sign with your wallet."));
          break;
        }
        const v = rule.verifier as { contract: string; tokenId?: string };
        results.push(await evalNft(v, proven));
        break;
      }
    }
  }
  return { results, provenAddress: proven };
}

function res(kind: ConditionKind, ok: boolean, message?: string): PolicyResult {
  return { kind, ok, status: ok ? "enforced" : "failed", message };
}

async function evalToken(
  v: { contract: string; minBaseUnits: string },
  owner: Address,
): Promise<PolicyResult> {
  if (!isAddress(v.contract)) {
    return res("token", false, "Token contract address is invalid.");
  }
  try {
    const bal = await erc20BalanceOf(getAddress(v.contract), owner);
    const ok = bal >= BigInt(v.minBaseUnits);
    return res("token", ok, ok ? undefined : "Insufficient token balance.");
  } catch {
    return res("token", false, "Couldn't read token balance on Coston2.");
  }
}

async function evalNft(
  v: { contract: string; tokenId?: string },
  owner: Address,
): Promise<PolicyResult> {
  if (!isAddress(v.contract)) {
    return res("nft", false, "NFT contract address is invalid.");
  }
  try {
    if (v.tokenId != null && v.tokenId !== "") {
      const holder = await erc721OwnerOf(getAddress(v.contract), BigInt(v.tokenId));
      const ok = getAddress(holder) === owner;
      return res("nft", ok, ok ? undefined : "You don't own the required NFT.");
    }
    const bal = await erc721BalanceOf(getAddress(v.contract), owner);
    const ok = bal > BigInt(0);
    return res("nft", ok, ok ? undefined : "You don't hold an NFT from this collection.");
  } catch {
    return res("nft", false, "Couldn't read NFT ownership on Coston2.");
  }
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** True only if every rule passed. */
export function isGranted(results: PolicyResult[]): boolean {
  return results.every((r) => r.ok);
}
