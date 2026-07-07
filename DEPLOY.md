# Deploying VaultDrop to Vercel

VaultDrop is a standard Next.js app. It needs a Postgres database (Supabase) and
a handful of environment variables. There is **no separate migration or key
setup step** — the database schema and the enclave identity both initialize
themselves on first request.

## 1. Prerequisites

- A **Supabase** project (for Postgres). Copy its **connection pooler** URL.
- A **GitHub** repo with this code.
- A **Vercel** account.

## 2. Environment variables

Set these in Vercel → Project → Settings → Environment Variables. They mirror
`.env.example`.

| Variable | Required | Value |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Supabase **pooler** connection string. |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployment URL, e.g. `https://vaultdrop.vercel.app`. |
| `NEXT_PUBLIC_FLARE_NETWORK` | Yes | `coston2` |
| `ENCLAVE_MODE` | Yes | `simulated` |
| `FCE_PROXY_URL` | — | Only for `ENCLAVE_MODE=coston2`. |
| `FLARE_RPC_URL` | — | Optional Coston2 RPC override. |

> Use the Supabase **connection pooler** URL (not the direct connection). The DB
> client sets `prepare: false`, which is required behind the pooler.

## 3. Deploy

1. Push the repo to GitHub.
2. In Vercel, **Import** the repo. The framework is auto-detected as Next.js;
   the default build command (`next build`) and output settings are correct.
3. Add the environment variables above.
4. **Deploy.**

On the first request, the app creates its tables (`vaults`, `vault_blobs`,
`enclave_identity`, `vault_seals`) and generates the enclave keypair, persisting
it in `enclave_identity`. Nothing else to configure.

## 4. Things to know

- **Runtime.** All API routes run on the Node.js runtime (they use Web Crypto +
  the `postgres` driver). Do not switch them to the Edge runtime.
- **Upload size.** Ciphertext is uploaded through a serverless function, which
  caps request bodies at ~4.5 MB, so `MAX_UPLOAD_BYTES` is **4 MB**. To support
  larger files, add a signed direct-to-Supabase-Storage upload path that bypasses
  the function (the encryption model is unchanged — it's still ciphertext only).
- **The enclave.** In `simulated` mode the enclave runs in-process — real ECIES
  key custody + ECDSA attestation on ordinary hardware. This is honest to state
  as "confidential-compute-style key custody, simulated." Switching to real
  Flare Confidential Compute is `ENCLAVE_MODE=coston2` + `FCE_PROXY_URL`
  (requires the FCE extension running and a Flare indexer credential). No code
  changes — the `EnclaveEngine` interface is the only thing that switches.
- **On-chain conditions.** wallet / token / NFT checks read Coston2 via
  `FLARE_RPC_URL` (defaults to the public endpoint). Read-only; no funds needed.
- **Secrets.** The content key is never stored server-side and never in the share
  link — it is sealed to the enclave. `.env.local` is git-ignored; only
  `.env.example` is committed.
