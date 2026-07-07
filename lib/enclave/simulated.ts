/**
 * SimulatedEnclave — runs the enclave logic in-process. This is a faithful
 * software model of the Flare Confidential Compute extension: the exact same
 * seal/unlock protocol, ECIES key custody, policy evaluation, and signed
 * attestation that the on-chain Coston2 enclave performs — just without the
 * AMD SEV hardware boundary. Selected when ENCLAVE_MODE=simulated (the default,
 * and what the hosted Vercel demo runs).
 */
import { base64UrlToBytes, sha256Hex } from "@/lib/crypto/bytes";
import type { AttestationClaim } from "@/lib/enclave/attestation";
import { signClaim } from "@/lib/enclave/attestation";
import {
  importEcdhPrivate,
  unwrapWithPrivateKey,
  wrapToPublicKey,
} from "@/lib/enclave/ecies";
import { importSigningPrivate } from "@/lib/enclave/attestation";
import { getEnclaveIdentity } from "@/lib/enclave/identity";
import { buildRules, evaluateRules, isGranted } from "@/lib/enclave/policy";
import {
  getSeal,
  incrementUnlockCount,
  putSeal,
} from "@/lib/repository/seal-repo";
import type {
  EnclaveEngine,
  EnclaveInfo,
  SealEnvelope,
  SealRequest,
  SealResult,
  UnlockProofs,
  UnlockRequest,
  UnlockResult,
} from "@/lib/enclave/types";

const MODE = "simulated" as const;

const decoder = new TextDecoder();

function recipientKeyHash(jwk: JsonWebKey): Promise<string> {
  // Bind the attestation to the exact key the CEK was re-wrapped to.
  return sha256Hex(new TextEncoder().encode(`${jwk.x ?? ""}.${jwk.y ?? ""}`));
}

export const simulatedEnclave: EnclaveEngine = {
  async info(): Promise<EnclaveInfo> {
    const id = await getEnclaveIdentity();
    return {
      mode: MODE,
      encryptionPublicJwk: id.encryptionPublicJwk,
      signingPublicJwk: id.signingPublicJwk,
      measurement: id.measurement,
    };
  },

  async seal(req: SealRequest): Promise<SealResult> {
    const id = await getEnclaveIdentity();
    const encPriv = await importEcdhPrivate(id.encryptionPrivateJwk);

    // Open the sender's sealed envelope — CEK + secrets only ever seen here.
    const envelope = JSON.parse(
      decoder.decode(await unwrapWithPrivateKey(encPriv, req.wrapped)),
    ) as SealEnvelope;

    const rules = await buildRules(
      envelope.conditions,
      envelope.secrets,
      new Date(),
    );

    // Re-wrap the CEK to the enclave's own key for storage at rest.
    const cek = base64UrlToBytes(envelope.cekB64Url);
    const wrappedCek = await wrapToPublicKey(id.encryptionPublicJwk, cek);
    await putSeal({ vaultId: req.vaultId, wrappedCek, rules });

    const sealRef = `seal_${(await sha256Hex(new TextEncoder().encode(wrappedCek.ct))).slice(0, 16)}`;
    return { ok: true, sealRef, measurement: id.measurement };
  },

  async unlock(req: UnlockRequest): Promise<UnlockResult> {
    const id = await getEnclaveIdentity();
    const signPriv = await importSigningPrivate(id.signingPrivateJwk);
    const seal = await getSeal(req.vaultId);

    const sign = async (
      decision: "granted" | "denied",
      results: UnlockResult["results"],
    ) => {
      const claim: AttestationClaim = {
        vaultId: req.vaultId,
        decision,
        recipientKeyHash: await recipientKeyHash(req.recipientPublicJwk),
        policyResults: results.map((r) => ({
          kind: r.kind,
          ok: r.ok,
          status: r.status,
        })),
        measurement: id.measurement,
        issuedAt: new Date().toISOString(),
        mode: MODE,
      };
      return signClaim(signPriv, claim);
    };

    if (!seal) {
      return {
        granted: false,
        results: [
          {
            kind: "passphrase",
            ok: false,
            status: "failed",
            message: "This vault is not sealed in the enclave.",
          },
        ],
        attestation: await sign("denied", [
          { kind: "passphrase", ok: false, status: "failed" },
        ]),
      };
    }

    const encPriv = await importEcdhPrivate(id.encryptionPrivateJwk);
    const proofs = JSON.parse(
      decoder.decode(await unwrapWithPrivateKey(encPriv, req.wrappedProofs)),
    ) as UnlockProofs;

    const { results, provenAddress } = await evaluateRules(seal.rules, proofs, {
      vaultId: req.vaultId,
      now: new Date(),
      unlockCount: seal.unlockCount,
    });
    const granted = isGranted(results);
    const proven = provenAddress ?? undefined;

    if (!granted) {
      return {
        granted: false,
        results,
        attestation: await sign("denied", results),
        provenAddress: proven,
      };
    }

    // Policy satisfied — unwrap the CEK and re-wrap it to the recipient.
    const cek = await unwrapWithPrivateKey(encPriv, seal.wrappedCek);
    const releasedKey = await wrapToPublicKey(req.recipientPublicJwk, cek);
    await incrementUnlockCount(req.vaultId);

    return {
      granted: true,
      results,
      releasedKey,
      attestation: await sign("granted", results),
      provenAddress: proven,
    };
  },
};
