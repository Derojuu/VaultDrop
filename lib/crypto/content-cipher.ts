/**
 * VaultDrop content encryption — real AES-256-GCM via Web Crypto.
 *
 * Model: every vault gets a random 256-bit Content Encryption Key (CEK). The
 * file is encrypted with it client-side; only the ciphertext ever leaves the
 * browser. The CEK is the single secret the enclave will later custody and
 * release on policy (see [[flare-confidential-compute]]). Until then it travels
 * in the share-link fragment (never sent to any server).
 */
import {
  base64ToBytes,
  base64UrlToBytes,
  bytesToBase64,
  bytesToBase64Url,
  sha256Hex,
} from "@/lib/crypto/bytes";

const ALGO = "AES-GCM";
const KEY_BITS = 256;
const IV_BYTES = 12;

export async function generateContentKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: ALGO, length: KEY_BITS }, true, [
    "encrypt",
    "decrypt",
  ]);
}

/** Export the raw CEK as URL-safe base64 (for the link fragment / enclave handoff). */
export async function exportContentKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return bytesToBase64Url(new Uint8Array(raw));
}

export async function importContentKey(keyB64Url: string): Promise<CryptoKey> {
  const raw = base64UrlToBytes(keyB64Url);
  return crypto.subtle.importKey(
    "raw",
    raw as BufferSource,
    { name: ALGO },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBytes(
  data: BufferSource,
  key: CryptoKey,
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, data);
  return { ciphertext, iv };
}

export async function decryptBytes(
  ciphertext: BufferSource,
  key: CryptoKey,
  iv: Uint8Array,
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { name: ALGO, iv: iv as BufferSource },
    key,
    ciphertext,
  );
}

export interface SealedFile {
  ciphertext: ArrayBuffer;
  /** Base64 GCM IV. */
  ivB64: string;
  /** URL-safe base64 CEK — the secret the enclave will custody. */
  keyB64Url: string;
  /** SHA-256 (hex) of the plaintext, for post-decrypt integrity check. */
  contentHash: string;
  name: string;
  size: number;
  type: string;
}

/** Encrypt a File end-to-end with a fresh CEK. */
export async function sealFile(file: File): Promise<SealedFile> {
  const data = await file.arrayBuffer();
  const key = await generateContentKey();
  const { ciphertext, iv } = await encryptBytes(data, key);
  return {
    ciphertext,
    ivB64: bytesToBase64(iv),
    keyB64Url: await exportContentKey(key),
    contentHash: await sha256Hex(data),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  };
}

/** Decrypt ciphertext back to plaintext bytes given the IV + CEK. */
export async function openSealedFile(
  ciphertext: BufferSource,
  ivB64: string,
  keyB64Url: string,
): Promise<ArrayBuffer> {
  const key = await importContentKey(keyB64Url);
  const iv = base64ToBytes(ivB64);
  return decryptBytes(ciphertext, key, iv);
}
