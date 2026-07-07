/**
 * ECIES — Elliptic Curve Integrated Encryption Scheme over P-256.
 *
 * This is how a secret is sealed *to* a public key so that only the holder of
 * the matching private key can open it. VaultDrop uses it twice:
 *   1. Sender → enclave: the file's Content Encryption Key (CEK) is wrapped to
 *      the enclave's public key before it ever leaves the browser, so no server
 *      in the middle can read it.
 *   2. Enclave → recipient: on a successful policy check, the enclave re-wraps
 *      the CEK to the recipient's ephemeral public key.
 *
 * Scheme: ephemeral ECDH (P-256) → HKDF-SHA256 → AES-256-GCM. Standard,
 * dependency-free, and isomorphic — the exact same code runs in the browser and
 * in the enclave/Node runtime (both expose Web Crypto as `crypto.subtle`).
 */
import { base64ToBytes, bytesToBase64 } from "@/lib/crypto/bytes";

/** A payload sealed to a public key. Safe to store or transmit in the clear. */
export interface WrappedPayload {
  /** Ephemeral sender public key (JWK) used for the ECDH handshake. */
  epk: JsonWebKey;
  /** Base64 AES-GCM IV. */
  iv: string;
  /** Base64 AES-GCM ciphertext (includes the auth tag). */
  ct: string;
}

const CURVE = "P-256";
// Fixed HKDF context — binds derived keys to this app + purpose.
const HKDF_INFO = new TextEncoder().encode("vaultdrop/ecies/v1");
const HKDF_SALT = new TextEncoder().encode("vaultdrop-ecies-salt");

export function importEcdhPublic(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: CURVE },
    true,
    [],
  );
}

export function importEcdhPrivate(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: CURVE },
    true,
    ["deriveBits"],
  );
}

/** Derive the shared AES-256-GCM key from an ECDH keypair via HKDF. */
async function sharedKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
): Promise<CryptoKey> {
  const bits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: publicKey },
    privateKey,
    256,
  );
  const hkdf = await crypto.subtle.importKey("raw", bits, "HKDF", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: HKDF_SALT, info: HKDF_INFO },
    hkdf,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Seal `payload` so only the holder of `recipientPubJwk`'s private key can open it. */
export async function wrapToPublicKey(
  recipientPubJwk: JsonWebKey,
  payload: Uint8Array,
): Promise<WrappedPayload> {
  const recipientPub = await importEcdhPublic(recipientPubJwk);
  const ephemeral = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: CURVE },
    true,
    ["deriveBits"],
  );
  const aesKey = await sharedKey(ephemeral.privateKey, recipientPub);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    payload as BufferSource,
  );
  return {
    epk: await crypto.subtle.exportKey("jwk", ephemeral.publicKey),
    iv: bytesToBase64(iv),
    ct: bytesToBase64(new Uint8Array(ct)),
  };
}

/** Open a payload previously wrapped to this private key. Throws if tampered. */
export async function unwrapWithPrivateKey(
  recipientPrivateKey: CryptoKey,
  wrapped: WrappedPayload,
): Promise<Uint8Array> {
  const ephemeralPub = await importEcdhPublic(wrapped.epk);
  const aesKey = await sharedKey(recipientPrivateKey, ephemeralPub);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(wrapped.iv) as BufferSource },
    aesKey,
    base64ToBytes(wrapped.ct) as BufferSource,
  );
  return new Uint8Array(pt);
}

/** Generate a fresh ECDH keypair (recipient identity for a single unlock). */
export async function generateEcdhKeyPair(): Promise<{
  publicJwk: JsonWebKey;
  privateKey: CryptoKey;
}> {
  const pair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: CURVE },
    true,
    ["deriveBits"],
  );
  return {
    publicJwk: await crypto.subtle.exportKey("jwk", pair.publicKey),
    privateKey: pair.privateKey,
  };
}
