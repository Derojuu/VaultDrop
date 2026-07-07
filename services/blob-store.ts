/**
 * Encrypted-blob transport. Uploads/downloads ciphertext to the server
 * (/api/vaults/[id]/blob → Postgres). Ciphertext only — the content key never
 * travels through here; it is sealed in the enclave (see services/enclave.ts).
 */

export async function uploadCiphertext(
  id: string,
  ciphertext: ArrayBuffer,
): Promise<void> {
  const res = await fetch(`/api/vaults/${encodeURIComponent(id)}/blob`, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: ciphertext,
  });
  if (!res.ok) {
    const msg = await res
      .json()
      .then((j) => (j as { message?: string })?.message)
      .catch(() => null);
    throw new Error(msg ?? "Ciphertext upload failed");
  }
}

/** Returns null if the ciphertext isn't found; throws if the vault is revoked. */
export async function downloadCiphertext(
  id: string,
): Promise<ArrayBuffer | null> {
  const res = await fetch(`/api/vaults/${encodeURIComponent(id)}/blob`);
  if (res.status === 404) return null;
  if (res.status === 410) throw new Error("This vault has been revoked.");
  if (!res.ok) throw new Error("Ciphertext download failed");
  return res.arrayBuffer();
}
