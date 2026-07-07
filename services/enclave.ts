/**
 * Browser-side enclave client. Talks to the /api/enclave/* boundary and does
 * the client-side half of the ECIES handshake, so the CEK and the sender's
 * secrets (passphrase) are wrapped to the enclave's public key *in the browser*
 * — they never reach the app server or database in the clear.
 *
 * On unlock it verifies the enclave's attestation signature before trusting the
 * released key: proof that the decision came from the measured enclave build.
 */
import { bytesToBase64Url } from "@/lib/crypto/bytes";
import type { Attestation } from "@/lib/enclave/attestation";
import { verifyAttestation } from "@/lib/enclave/attestation";
import {
  generateEcdhKeyPair,
  unwrapWithPrivateKey,
  wrapToPublicKey,
  type WrappedPayload,
} from "@/lib/enclave/ecies";
import type { ConditionKind } from "@/lib/constants";
import type {
  EnclaveInfo,
  PolicyResult,
  SealEnvelope,
  UnlockProofs,
} from "@/lib/enclave/types";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ?? res.statusText;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return payload as T;
}

let infoCache: Promise<EnclaveInfo> | null = null;

export function getEnclaveInfo(): Promise<EnclaveInfo> {
  infoCache ??= jsonFetch<EnclaveInfo>("/api/enclave/info").catch((e) => {
    infoCache = null;
    throw e;
  });
  return infoCache;
}

const encoder = new TextEncoder();

/**
 * Seal a vault's CEK into the enclave. `cekB64Url` is the raw content key; it is
 * wrapped to the enclave here and discarded by the caller afterwards.
 */
export async function sealToEnclave(input: {
  vaultId: string;
  cekB64Url: string;
  passphrase?: string;
  conditions: { kind: ConditionKind; config?: Record<string, unknown> }[];
}): Promise<void> {
  const info = await getEnclaveInfo();
  const envelope: SealEnvelope = {
    cekB64Url: input.cekB64Url,
    secrets: input.passphrase ? { passphrase: input.passphrase } : {},
    conditions: input.conditions,
  };
  const wrapped = await wrapToPublicKey(
    info.encryptionPublicJwk,
    encoder.encode(JSON.stringify(envelope)),
  );
  await jsonFetch("/api/enclave/seal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vaultId: input.vaultId, wrapped }),
  });
}

export interface UnlockOutcome {
  granted: boolean;
  results: PolicyResult[];
  /** Verified against the enclave's published signing key. */
  attestationVerified: boolean;
  attestation: Attestation;
  /** Present + verified only when granted: the raw CEK, URL-safe base64. */
  cekB64Url?: string;
}

interface UnlockResponse {
  granted: boolean;
  results: PolicyResult[];
  releasedKey?: WrappedPayload;
  attestation: Attestation;
}

/**
 * Ask the enclave to release the key. Generates a fresh ephemeral keypair, sends
 * proofs wrapped to the enclave, verifies the returned attestation, and — only
 * if granted and verified — unwraps the CEK with the ephemeral private key.
 */
export async function unlockViaEnclave(input: {
  vaultId: string;
  proofs: UnlockProofs;
}): Promise<UnlockOutcome> {
  const info = await getEnclaveInfo();
  const ephemeral = await generateEcdhKeyPair();

  const wrappedProofs = await wrapToPublicKey(
    info.encryptionPublicJwk,
    encoder.encode(JSON.stringify(input.proofs)),
  );

  const res = await jsonFetch<UnlockResponse>("/api/enclave/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vaultId: input.vaultId,
      recipientPublicJwk: ephemeral.publicJwk,
      wrappedProofs,
    }),
  });

  const attestationVerified = await verifyAttestation(
    info.signingPublicJwk,
    res.attestation,
  );

  let cekB64Url: string | undefined;
  if (res.granted && res.releasedKey && attestationVerified) {
    const cek = await unwrapWithPrivateKey(ephemeral.privateKey, res.releasedKey);
    cekB64Url = bytesToBase64Url(cek);
  }

  return {
    granted: res.granted,
    results: res.results,
    attestationVerified,
    attestation: res.attestation,
    cekB64Url,
  };
}
