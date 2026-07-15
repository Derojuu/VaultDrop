/**
 * Vault audit log — the attested access trail. Every seal / unlock / deny /
 * revoke is recorded here, so the sender's dashboard (Activity, Recipients) is
 * backed by real events, not mock data. Server-only.
 */
import { db, ensureSchema } from "@/lib/db";
import type { Recipient, VaultEvent, VaultEventType } from "@/types";

function eventId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  const b64url = Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `evt_${b64url}`;
}

export interface RecordEventInput {
  vaultId: string;
  type: VaultEventType;
  wallet?: string | null;
  measurement?: string | null;
  meta?: Record<string, unknown>;
}

/**
 * Append an event. Best-effort by design — callers wrap this so a logging
 * failure never breaks the underlying seal/unlock/revoke operation.
 */
export async function recordEvent(input: RecordEventInput): Promise<void> {
  await ensureSchema();
  const sql = db();
  await sql`
    insert into vault_events (id, vault_id, type, wallet, measurement, meta)
    values (${eventId()}, ${input.vaultId}, ${input.type},
            ${input.wallet ?? null}, ${input.measurement ?? null},
            ${sql.json((input.meta ?? {}) as never)})
  `;
}

interface EventRow {
  id: string;
  vault_id: string;
  vault_name: string | null;
  type: string;
  at: Date;
  wallet: string | null;
  measurement: string | null;
  meta: Record<string, unknown>;
}

function toEvent(r: EventRow): VaultEvent {
  return {
    id: r.id,
    vaultId: r.vault_id,
    vaultName: r.vault_name ?? undefined,
    type: r.type as VaultEventType,
    at: new Date(r.at).toISOString(),
    wallet: r.wallet ?? undefined,
    measurement: r.measurement ?? undefined,
    meta: r.meta ?? {},
  };
}

/** Recent events across all vaults (or one vault), newest first. */
export async function listEvents(opts: {
  ownerId: string;
  vaultId?: string;
  limit?: number;
}): Promise<VaultEvent[]> {
  await ensureSchema();
  const sql = db();
  const limit = Math.min(opts?.limit ?? 200, 500);
  const rows = opts?.vaultId
    ? await sql<EventRow[]>`
        select e.*, v.name as vault_name
        from vault_events e join vaults v on v.id = e.vault_id
        where e.vault_id = ${opts.vaultId}
          and v.owner_id = ${opts.ownerId}
        order by e.at desc limit ${limit}
      `
    : await sql<EventRow[]>`
        select e.*, v.name as vault_name
        from vault_events e join vaults v on v.id = e.vault_id
        where v.owner_id = ${opts.ownerId}
        order by e.at desc limit ${limit}
      `;
  return rows.map(toEvent);
}

interface RecipientRow {
  wallet: string;
  unlocks: string | number;
  denials: string | number;
  last_at: Date;
  vault_ids: string[];
}

/** Distinct proven wallets with their unlock/deny tallies. */
export async function listRecipients(ownerId: string): Promise<Recipient[]> {
  await ensureSchema();
  const rows = await db()<RecipientRow[]>`
    select
      e.wallet,
      count(*) filter (where e.type = 'unlocked') as unlocks,
      count(*) filter (where e.type = 'denied') as denials,
      max(e.at) as last_at,
      array_agg(distinct e.vault_id) as vault_ids
    from vault_events e
    join vaults v on v.id = e.vault_id
    where e.wallet is not null
      and v.owner_id = ${ownerId}
    group by e.wallet
    order by max(e.at) desc
  `;
  return rows.map((r) => ({
    wallet: r.wallet,
    unlocks: Number(r.unlocks),
    denials: Number(r.denials),
    lastAt: new Date(r.last_at).toISOString(),
    vaultIds: r.vault_ids ?? [],
  }));
}
