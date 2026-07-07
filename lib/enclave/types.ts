/**
 * Shared enclave contract types + the Flare FCE instruction constants.
 *
 * The op pairs mirror the `fce-sign` "Private Key Extension" routing model
 * (opType / opCommand bytes32 pairs dispatched by InstructionSender.sol). Our
 * simulated engine dispatches on the same pairs so the remote (Coston2) adapter
 * is a drop-in — see lib/enclave/engine.ts.
 */
import type { ConditionKind } from "@/lib/constants";
import type { Attestation } from "@/lib/enclave/attestation";
import type { WrappedPayload } from "@/lib/enclave/ecies";

/** VaultDrop's op type within the FCE registry. */
export const OP_TYPE_VAULTDROP = "vaultdrop.keycustody.v1";
/** Seal a CEK + policy into the enclave. */
export const OP_COMMAND_SEAL = "vaultdrop.seal";
/** Evaluate policy and, if satisfied, release the CEK. */
export const OP_COMMAND_UNLOCK = "vaultdrop.unlock";

export type EnclaveMode = "simulated" | "coston2";

/** Public enclave identity — served at /api/enclave/info (mirrors proxy /info). */
export interface EnclaveInfo {
  mode: EnclaveMode;
  /** Public key CEKs/secrets are wrapped to (ECDH P-256, JWK). */
  encryptionPublicJwk: JsonWebKey;
  /** Public key attestations are verified against (ECDSA P-256, JWK). */
  signingPublicJwk: JsonWebKey;
  /** Reproducible code measurement of the enclave build. */
  measurement: string;
}

/** One access rule as the enclave stores/evaluates it (no plaintext secrets). */
export interface PolicyRule {
  kind: ConditionKind;
  /** Rule-specific verifier data: passphrase salt+hash, expiry deadline, etc. */
  verifier?: Record<string, unknown>;
}

/** What the sender sends the enclave at seal time, wrapped to the enclave key. */
export interface SealEnvelope {
  /** URL-safe base64 raw CEK. */
  cekB64Url: string;
  /** Plaintext secrets that never touch a server — only the enclave. */
  secrets: { passphrase?: string };
  /** The conditions to enforce, with their public config. */
  conditions: { kind: ConditionKind; config?: Record<string, unknown> }[];
}

export interface SealRequest {
  vaultId: string;
  /** SealEnvelope, ECIES-wrapped to the enclave's encryption public key. */
  wrapped: WrappedPayload;
}

export interface SealResult {
  ok: true;
  sealRef: string;
  measurement: string;
}

/** Proofs the recipient supplies, wrapped to the enclave key. */
export interface UnlockProofs {
  passphrase?: string;
  ndaAccepted?: boolean;
  /** Address the recipient claims — proven by `walletSignature`. */
  walletAddress?: string;
  /** Signature over the vault-bound challenge (see lib/enclave/challenge.ts). */
  walletSignature?: string;
}

export interface UnlockRequest {
  vaultId: string;
  /** Recipient's ephemeral ECDH public key — where a granted CEK is re-wrapped. */
  recipientPublicJwk: JsonWebKey;
  /** UnlockProofs, ECIES-wrapped to the enclave's encryption public key. */
  wrappedProofs: WrappedPayload;
}

export interface PolicyResult {
  kind: ConditionKind;
  ok: boolean;
  /** "enforced" | "deferred" | "failed" — honest about what was actually checked. */
  status: "enforced" | "deferred" | "failed";
  message?: string;
}

export interface UnlockResult {
  granted: boolean;
  results: PolicyResult[];
  /** Present only when granted: the CEK re-wrapped to the recipient. */
  releasedKey?: WrappedPayload;
  /** Signed decision — verifiable against EnclaveInfo.signingPublicJwk. */
  attestation: Attestation;
  /** The proven wallet address, if the recipient supplied one (for the audit log). */
  provenAddress?: string;
}

/** The seam between VaultDrop and the confidential enclave (sim or Coston2). */
export interface EnclaveEngine {
  info(): Promise<EnclaveInfo>;
  seal(req: SealRequest): Promise<SealResult>;
  unlock(req: UnlockRequest): Promise<UnlockResult>;
}
