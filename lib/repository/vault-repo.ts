import { db, ensureSchema } from "@/lib/db";
import type { FlareNetworkKey } from "@/lib/constants";
import type { AccessCondition, Vault, VaultStatus } from "@/types";

interface Row {
  id: string;
  name: string;
  file_name: string;
  file_size: string | number;
  mime_type: string;
  status: string;
  network: string;
  created_at: Date;
  updated_at: Date;
  seal_ref: string | null;
  iv_b64: string | null;
  content_hash: string | null;
  conditions: AccessCondition[];
}

function toVault(r: Row): Vault {
  return {
    id: r.id,
    name: r.name,
    fileName: r.file_name,
    fileSize: Number(r.file_size),
    mimeType: r.mime_type,
    status: r.status as VaultStatus,
    network: r.network as FlareNetworkKey,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
    sealRef: r.seal_ref ?? undefined,
    ivB64: r.iv_b64 ?? undefined,
    contentHash: r.content_hash ?? undefined,
    conditions: r.conditions ?? [],
  };
}

export async function listVaults(): Promise<Vault[]> {
  await ensureSchema();
  const rows = await db()<Row[]>`
    select * from vaults order by created_at desc
  `;
  return rows.map(toVault);
}

export async function getVault(id: string): Promise<Vault | null> {
  await ensureSchema();
  const rows = await db()<Row[]>`
    select * from vaults where id = ${id} limit 1
  `;
  return rows[0] ? toVault(rows[0]) : null;
}

export interface InsertVaultInput {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  conditions: AccessCondition[];
  network: FlareNetworkKey;
  sealRef: string;
  ivB64?: string;
  contentHash?: string;
}

export async function insertVault(v: InsertVaultInput): Promise<Vault> {
  await ensureSchema();
  const sql = db();
  const rows = await sql<Row[]>`
    insert into vaults
      (id, name, file_name, file_size, mime_type, status, network,
       seal_ref, iv_b64, content_hash, conditions)
    values
      (${v.id}, ${v.name}, ${v.fileName}, ${v.fileSize}, ${v.mimeType},
       'sealed', ${v.network}, ${v.sealRef}, ${v.ivB64 ?? null},
       ${v.contentHash ?? null}, ${sql.json(v.conditions as never)})
    returning *
  `;
  return toVault(rows[0]);
}

export async function revokeVault(id: string): Promise<Vault | null> {
  await ensureSchema();
  const rows = await db()<Row[]>`
    update vaults set status = 'revoked', updated_at = now()
    where id = ${id}
    returning *
  `;
  return rows[0] ? toVault(rows[0]) : null;
}
