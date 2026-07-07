/**
 * Attestation — the enclave signs every access decision so a recipient (or
 * anyone) can verify the release came from a specific, measured enclave build
 * and was not forged by a server in the middle.
 *
 * Signature: ECDSA P-256 over SHA-256 of a canonical JSON encoding of the
 * decision. In real Flare Confidential Compute this signing key is the
 * hardware-attested TEE identity; here (simulated mode) it is the enclave
 * identity persisted in `enclave_identity`. The verification code below is
 * identical in both modes, and runs in the recipient's browser.
 */
import { base64ToBytes, bytesToBase64 } from "@/lib/crypto/bytes";

/** The statement the enclave signs when it releases (or denies) a key. */
export interface AttestationClaim {
  vaultId: string;
  /** "granted" | "denied" — the enclave's decision. */
  decision: string;
  /** SHA-256 (hex) of the recipient public key the CEK was re-wrapped to. */
  recipientKeyHash: string;
  /** Which conditions were enforced, and their per-condition verdicts. */
  policyResults: { kind: string; ok: boolean; status: string }[];
  /** Reproducible code measurement of the enclave build (see identity.ts). */
  measurement: string;
  /** ISO timestamp of the decision. */
  issuedAt: string;
  /** "simulated" | "coston2". Honest about where the enclave ran. */
  mode: string;
}

export interface Attestation {
  claim: AttestationClaim;
  /** Base64 ECDSA signature over the canonical claim. */
  signature: string;
}

/**
 * Deterministic JSON: object keys sorted recursively so signer and verifier
 * hash byte-identical input regardless of property order.
 */
function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`);
  return `{${entries.join(",")}}`;
}

function claimBytes(claim: AttestationClaim): Uint8Array {
  return new TextEncoder().encode(canonicalize(claim));
}

export function importSigningPrivate(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

export function importSigningPublic(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"],
  );
}

/** Enclave-side: sign a decision with the TEE identity key. */
export async function signClaim(
  signingPrivateKey: CryptoKey,
  claim: AttestationClaim,
): Promise<Attestation> {
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    signingPrivateKey,
    claimBytes(claim) as BufferSource,
  );
  return { claim, signature: bytesToBase64(new Uint8Array(sig)) };
}

/** Anyone: verify a decision was signed by the enclave's published key. */
export async function verifyAttestation(
  signerPublicJwk: JsonWebKey,
  attestation: Attestation,
): Promise<boolean> {
  try {
    const key = await importSigningPublic(signerPublicJwk);
    return await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      base64ToBytes(attestation.signature) as BufferSource,
      claimBytes(attestation.claim) as BufferSource,
    );
  } catch {
    return false;
  }
}
