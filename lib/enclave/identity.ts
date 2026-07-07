/**
 * Enclave identity — the keypairs that make the enclave a real cryptographic
 * authority. Server-only. Never import from client code.
 *
 *   - encryption keypair (ECDH P-256): secrets are wrapped *to* its public key;
 *     only the enclave can unwrap them.
 *   - signing keypair (ECDSA P-256): signs every access decision (attestation).
 *
 * The private keys are the root of trust. In real Flare Confidential Compute
 * they live in AMD SEV memory, released to the enclave only after the boot
 * measurement is attested on-chain. Here (simulated mode) they are persisted in
 * the `enclave_identity` table — the honest stand-in for hardware sealing. The
 * PUBLIC keys and `measurement` are published via /api/enclave/info.
 */
import { db, ensureSchema } from "@/lib/db";
import { sha256Hex } from "@/lib/crypto/bytes";

/**
 * Reproducible build measurement. In real FCC this is the whitelisted Docker
 * image code-hash (`allow-tee-version`); here it hashes the enclave's build tag
 * so a recipient can pin "which enclave build" released their key.
 */
const ENCLAVE_BUILD = "vaultdrop-enclave@0.1.0";

const IDENTITY_ID = "default";

export interface EnclaveIdentity {
  encryptionPrivateJwk: JsonWebKey;
  encryptionPublicJwk: JsonWebKey;
  signingPrivateJwk: JsonWebKey;
  signingPublicJwk: JsonWebKey;
  measurement: string;
}

interface IdentityRow {
  encryption_private_jwk: JsonWebKey;
  encryption_public_jwk: JsonWebKey;
  signing_private_jwk: JsonWebKey;
  signing_public_jwk: JsonWebKey;
  measurement: string;
}

let cached: Promise<EnclaveIdentity> | null = null;

async function measurement(): Promise<string> {
  return sha256Hex(new TextEncoder().encode(ENCLAVE_BUILD));
}

async function generateIdentity(): Promise<EnclaveIdentity> {
  const enc = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );
  const sig = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const [encPriv, encPub, sigPriv, sigPub] = await Promise.all([
    crypto.subtle.exportKey("jwk", enc.privateKey),
    crypto.subtle.exportKey("jwk", enc.publicKey),
    crypto.subtle.exportKey("jwk", sig.privateKey),
    crypto.subtle.exportKey("jwk", sig.publicKey),
  ]);
  return {
    encryptionPrivateJwk: encPriv,
    encryptionPublicJwk: encPub,
    signingPrivateJwk: sigPriv,
    signingPublicJwk: sigPub,
    measurement: await measurement(),
  };
}

async function load(): Promise<EnclaveIdentity> {
  await ensureSchema();
  const sql = db();
  const rows = await sql<IdentityRow[]>`
    select encryption_private_jwk, encryption_public_jwk,
           signing_private_jwk, signing_public_jwk, measurement
    from enclave_identity where id = ${IDENTITY_ID} limit 1
  `;
  if (rows[0]) {
    return {
      encryptionPrivateJwk: rows[0].encryption_private_jwk,
      encryptionPublicJwk: rows[0].encryption_public_jwk,
      signingPrivateJwk: rows[0].signing_private_jwk,
      signingPublicJwk: rows[0].signing_public_jwk,
      measurement: rows[0].measurement,
    };
  }

  const identity = await generateIdentity();
  // on conflict do nothing → first writer wins if two cold starts race.
  await sql`
    insert into enclave_identity
      (id, encryption_private_jwk, encryption_public_jwk,
       signing_private_jwk, signing_public_jwk, measurement)
    values
      (${IDENTITY_ID}, ${sql.json(identity.encryptionPrivateJwk as never)},
       ${sql.json(identity.encryptionPublicJwk as never)},
       ${sql.json(identity.signingPrivateJwk as never)},
       ${sql.json(identity.signingPublicJwk as never)}, ${identity.measurement})
    on conflict (id) do nothing
  `;
  // Re-read so every instance converges on the same stored identity.
  const settled = await sql<IdentityRow[]>`
    select encryption_private_jwk, encryption_public_jwk,
           signing_private_jwk, signing_public_jwk, measurement
    from enclave_identity where id = ${IDENTITY_ID} limit 1
  `;
  const r = settled[0];
  return {
    encryptionPrivateJwk: r.encryption_private_jwk,
    encryptionPublicJwk: r.encryption_public_jwk,
    signingPrivateJwk: r.signing_private_jwk,
    signingPublicJwk: r.signing_public_jwk,
    measurement: r.measurement,
  };
}

/** Load (or lazily create) the persistent enclave identity. Memoized per instance. */
export function getEnclaveIdentity(): Promise<EnclaveIdentity> {
  cached ??= load().catch((err) => {
    cached = null; // allow retry on next request
    throw err;
  });
  return cached;
}
