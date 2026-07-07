/**
 * Sealed-key custody store. Server-only — this holds the CEK wrapped to the
 * enclave key plus the policy verifiers. It is NEVER returned to any client;
 * only the enclave engine reads it. (Contrast vault-repo, which serves public
 * vault metadata.)
 */
import { db, ensureSchema } from "@/lib/db";
import type { WrappedPayload } from "@/lib/enclave/ecies";
import type { PolicyRule } from "@/lib/enclave/types";

export interface VaultSeal {
  vaultId: string;
  /** CEK wrapped to the enclave's own encryption key (openable only in-enclave). */
  wrappedCek: WrappedPayload;
  /** Policy verifiers (passphrase hash+salt, expiry deadline, limits). */
  rules: PolicyRule[];
  unlockCount: number;
  sealedAt: string;
}

interface SealRow {
  vault_id: string;
  wrapped_cek: WrappedPayload;
  rules: PolicyRule[];
  unlock_count: number;
  sealed_at: Date;
}

function toSeal(r: SealRow): VaultSeal {
  return {
    vaultId: r.vault_id,
    wrappedCek: r.wrapped_cek,
    rules: r.rules ?? [],
    unlockCount: r.unlock_count,
    sealedAt: new Date(r.sealed_at).toISOString(),
  };
}

export async function putSeal(input: {
  vaultId: string;
  wrappedCek: WrappedPayload;
  rules: PolicyRule[];
}): Promise<void> {
  await ensureSchema();
  const sql = db();
  await sql`
    insert into vault_seals (vault_id, wrapped_cek, rules)
    values (${input.vaultId}, ${sql.json(input.wrappedCek as never)},
            ${sql.json(input.rules as never)})
    on conflict (vault_id) do update
      set wrapped_cek = excluded.wrapped_cek,
          rules = excluded.rules,
          unlock_count = 0,
          sealed_at = now()
  `;
}

export async function getSeal(vaultId: string): Promise<VaultSeal | null> {
  await ensureSchema();
  const rows = await db()<SealRow[]>`
    select * from vault_seals where vault_id = ${vaultId} limit 1
  `;
  return rows[0] ? toSeal(rows[0]) : null;
}

/** Bump the successful-unlock counter (enforces download-limit / one-time). */
export async function incrementUnlockCount(vaultId: string): Promise<number> {
  await ensureSchema();
  const rows = await db()<{ unlock_count: number }[]>`
    update vault_seals set unlock_count = unlock_count + 1
    where vault_id = ${vaultId}
    returning unlock_count
  `;
  return rows[0]?.unlock_count ?? 0;
}
