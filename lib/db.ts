import postgres from "postgres";

/**
 * Server-only Postgres client (Supabase). Never import this from client code.
 *
 * Uses DATABASE_URL (preferred) or POSTGRES_URL. `prepare: false` keeps it safe
 * behind Supabase's connection pooler. Schema is created lazily on first use so
 * there's no separate migration step.
 */

type Sql = ReturnType<typeof postgres>;

let sql: Sql | null = null;
let schemaReady: Promise<void> | null = null;

function connectionString(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "No database configured — set DATABASE_URL or POSTGRES_URL in .env.local",
    );
  }
  return url;
}

export function db(): Sql {
  sql ??= postgres(connectionString(), {
    ssl: "require",
    prepare: false,
    // Keep the per-instance pool small: on Vercel each serverless invocation is
    // its own process, and the Supabase pooler multiplexes on the far side.
    // A low ceiling avoids exhausting connections under bursty traffic.
    max: 3,
    idle_timeout: 20,
    connection: { application_name: "vaultdrop" },
  });
  return sql;
}

/** Create tables if they don't exist. Memoized so it runs once per process. */
export function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const s = db();
    await s`
      create table if not exists vaults (
        id text primary key,
        owner_id text not null,
        name text not null,
        file_name text not null,
        file_size bigint not null,
        mime_type text not null,
        status text not null,
        network text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        seal_ref text,
        iv_b64 text,
        content_hash text,
        conditions jsonb not null default '[]'::jsonb
      )
    `;
    await s`alter table vaults add column if not exists owner_id text`;
    await s`create index if not exists vaults_owner_idx on vaults (owner_id, created_at desc)`;
    await s`
      create table if not exists vault_blobs (
        id text primary key references vaults(id) on delete cascade,
        ciphertext bytea not null,
        content_type text not null default 'application/octet-stream',
        created_at timestamptz not null default now()
      )
    `;
    // Enclave identity — the simulated stand-in for SEV-sealed TEE memory.
    // Singleton row; the enclave's private keys never leave this table.
    await s`
      create table if not exists enclave_identity (
        id text primary key,
        encryption_private_jwk jsonb not null,
        encryption_public_jwk jsonb not null,
        signing_private_jwk jsonb not null,
        signing_public_jwk jsonb not null,
        measurement text not null,
        created_at timestamptz not null default now()
      )
    `;
    // Sealed key custody — the CEK wrapped to the enclave key + policy verifiers.
    // Never returned to any client; only the enclave routes read this.
    await s`
      create table if not exists vault_seals (
        vault_id text primary key references vaults(id) on delete cascade,
        wrapped_cek jsonb not null,
        rules jsonb not null default '[]'::jsonb,
        unlock_count int not null default 0,
        sealed_at timestamptz not null default now()
      )
    `;
    // Audit log — the attested access trail (seal / unlock / deny / revoke).
    // `wallet` is set only for wallet-gated unlocks (a proven address);
    // passphrase-only unlocks stay anonymous. `measurement` pins the enclave
    // build that made the decision.
    await s`
      create table if not exists vault_events (
        id text primary key,
        vault_id text not null references vaults(id) on delete cascade,
        type text not null,
        at timestamptz not null default now(),
        wallet text,
        measurement text,
        meta jsonb not null default '{}'::jsonb
      )
    `;
    await s`create index if not exists vault_events_vault_idx on vault_events (vault_id)`;
    await s`create index if not exists vault_events_at_idx on vault_events (at desc)`;
  })().catch((err) => {
    schemaReady = null; // allow retry on next request
    throw err;
  });
  return schemaReady;
}
