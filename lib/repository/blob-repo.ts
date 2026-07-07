import { db, ensureSchema } from "@/lib/db";

/**
 * Server-side ciphertext store — Postgres `bytea`. Holds ONLY encrypted bytes
 * (never the content key). Rows are cascade-deleted with their vault.
 */

export interface StoredCiphertext {
  ciphertext: Uint8Array;
  contentType: string;
}

export async function putCiphertext(
  id: string,
  ciphertext: Uint8Array,
  contentType: string,
): Promise<void> {
  await ensureSchema();
  await db()`
    insert into vault_blobs (id, ciphertext, content_type)
    values (${id}, ${ciphertext}, ${contentType})
    on conflict (id) do update
      set ciphertext = excluded.ciphertext,
          content_type = excluded.content_type
  `;
}

export async function getCiphertext(
  id: string,
): Promise<StoredCiphertext | null> {
  await ensureSchema();
  const rows = await db()<
    { ciphertext: Uint8Array; content_type: string }[]
  >`
    select ciphertext, content_type from vault_blobs where id = ${id} limit 1
  `;
  if (!rows[0]) return null;
  return {
    ciphertext: rows[0].ciphertext,
    contentType: rows[0].content_type,
  };
}

export async function deleteCiphertext(id: string): Promise<void> {
  await ensureSchema();
  await db()`delete from vault_blobs where id = ${id}`;
}
