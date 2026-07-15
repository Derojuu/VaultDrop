# VaultDrop

<img width="1792" height="576" alt="grok_image_1783445123827" src="https://github.com/user-attachments/assets/e3239bd6-4065-4f62-8b4e-0fcd41dc805f" />

**Every file has rules — because the key lives where no one can touch it.**

A secure file-sharing app where a file's decryption key is sealed inside a **Flare Confidential
Compute** enclave and released **only** when the recipient provably satisfies the sender's access
conditions. No server — not even VaultDrop's — can read the file or hand out the key.

| | |
| --- | --- |
| **Bounty** | Flare Summer Signal — #2 Confidential Compute Apps |
| **Network** | Coston2 (Flare testnet) — read-only, on-chain condition checks |
| **Enclave** | `simulated` on the hosted demo · real-hardware path is a config flip |
| **Status** | Deploy-ready · `typecheck` + `lint` + `build` clean |
| **Stack** | Next.js 16 · React 19 · viem · Web Crypto · Supabase Postgres |

**Quick links (for judges):**
[Demo video](#watch-the-demo) · [Live app](#live-deployments) · [Pitch deck](./PITCH.md) · [Deploy runbook](./DEPLOY.md) · [Load-bearing files](#load-bearing-files-for-judges) · [Source](https://github.com/Derojuu/VaultDrop)

---

## Overview

**The problem.** Once you share a file link, you've lost control. Links get forwarded, passwords get
reused, and the platform holding your file can be breached or compelled to hand it over. For anyone
sharing genuinely sensitive material — contracts, credentials, deal docs, source, media — "hope no
one misuses the link" is the current state of the art.

**The solution.** VaultDrop turns each file into a **sealed vault**: encrypted in your browser, its
key wrapped to a confidential-compute enclave alongside the sender's policy — never stored on a
server, never placed in the share link. The enclave releases the key **only** when a recipient
provably satisfies every condition, and it **signs the decision** so anyone can verify the release
came from the enclave and not the operator. The question changes from *"who has the link?"* to
*"who has provably satisfied every rule?"*

**Who it's for.** Freelancers and agencies delivering payment-gated files (*"the key releases only
after the client holds the access token"*) — plus legal/NDA delivery, dealmakers sharing diligence
docs, and creators gating media.

---

## Watch the demo

**`<< link to your 2–3 min demo video — see DEMO.md for the script >>`**

**Seal it. Share it. The key never touches a server.** A file is encrypted in your browser, and its
key is wrapped to a confidential-compute enclave — never stored on a server, never placed in the
share link. The enclave releases the key only when a recipient satisfies the policy, and it **signs
every decision** so anyone can verify the release came from the enclave and not the operator. The
public moments are named every time: the **ciphertext** is stored on the server, and **on-chain
condition checks** (wallet / token / NFT) read Flare's Coston2 testnet — everything about the key
itself stays inside the enclave.

> **Unaudited hackathon software.** The hosted demo runs the enclave in **simulated** mode — the
> real ECIES key-custody and ECDSA attestation protocol, running in-process rather than inside AMD
> SEV hardware. Testnet (Coston2) is the only network touched, and only for read-only condition

This is not a general "zero-knowledge" system, not anonymous file sharing, and not a claim of
hardware attestation the hosted demo doesn't have. It is confidential-compute **key custody** with
honest boundaries: the security *contract* — server never holds the key, key released only on an
in-enclave policy pass, decision signed and verifiable — is genuinely enforced, and the real-hardware
path is a documented config flip.

---

## Live deployments

VaultDrop is a single Next.js app. It is **deploy-ready** but not yet hosted by the author — fill
these in after you deploy (see [`DEPLOY.md`](./DEPLOY.md)).

| Surface | URL |
| --- | --- |
| Web app | `<< https://your-app.vercel.app >>` |
| Enclave trust page (verify any receipt) | `<< https://your-app.vercel.app/enclave >>` |
| Source code | https://github.com/Derojuu/VaultDrop |

The app needs only a Supabase Postgres URL and a few env vars; the database schema and the enclave
identity **initialize themselves on first request** — there is no separate migration or key-setup
step. Networks are a config toggle: `ENCLAVE_MODE=simulated` (hosted demo) ↔ `coston2` (real FCE
extension) with no code change.

---

## How it compares

| | Key custody | Private conditions<br>(secret passphrase / allowlist) | Operator can override? |
| --- | --- | --- | --- |
| **Centralized** (Dropbox, DocSend, WeTransfer, Tresorit) | Platform holds the key | In code you must trust | **Yes** — a breach, insider, or subpoena exposes it |
| **Smart contract / transparent chain alone** | Key would be on-chain | No — can't evaluate a *secret* on a public ledger | N/A |
| **Lit Protocol** | Threshold MPC across a node network | Yes | Depends on the node set |
| **VaultDrop** | Sealed in a Flare Confidential Compute enclave | Yes — evaluated privately in-enclave | **No** — operator is cryptographically incapable |

Lit is the comparison a technical judge will raise: it uses threshold MPC across a node network;
VaultDrop uses **TEE-based confidential compute native to an EVM L1**, so policy evaluation, key
custody, and on-chain checks live in one trust domain — on Flare.

---

## Try it (5 minutes, local)

Nothing to install to try it — the app runs in any browser.

1. `pnpm install && pnpm dev`, open http://localhost:3000, go to the dashboard.
2. **New vault** → drop a file (under 4 MB) → name it.
3. On **Rules**, pick **Secret passphrase** and set one. *(Optionally add wallet / token / NFT
   gating — those read Coston2.)*
4. **Encrypt & seal.** The file is encrypted in-browser; the key is wrapped to the enclave. Copy the
   share link — **notice there's no key in it.**
5. Open the link in an **incognito window** (you're now the recipient). The link alone won't decrypt.
6. Enter the passphrase → **Unlock & download.** The enclave checks the policy, releases the key, and
   shows a **signed attestation receipt**.
7. Click **Copy receipt**, open **/enclave**, paste it into the verifier → **"Valid."** You just
   verified the release against the enclave's key without trusting the server.

---

## Quickstart

Prerequisites: **Node 20+** and **pnpm** (`corepack enable` or `npm i -g pnpm`). The repo uses pnpm.

```bash
pnpm install
cp .env.example .env.local   # set DATABASE_URL (Supabase); other vars have safe defaults
pnpm dev                     # http://localhost:3000
```

Quality gates:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # ESLint (Next + Prettier compatible)
pnpm build       # production build (run with the dev server stopped)
```

Environment variables (full list in [`.env.example`](./.env.example), runbook in
[`DEPLOY.md`](./DEPLOY.md)):

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Supabase Postgres (use the **pooler** URL). |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL used for Google authentication. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Public Supabase browser key. |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL. |
| `NEXT_PUBLIC_FLARE_NETWORK` | Yes | `coston2` |
| `ENCLAVE_MODE` | Yes | `simulated` (default) or `coston2`. |
| `FCE_PROXY_URL` | — | Only for `ENCLAVE_MODE=coston2`. |
| `FLARE_RPC_URL` | — | Optional Coston2 RPC override. |

---

## Repository layout

```
app/
  api/enclave/        the TEE boundary — info · seal · unlock route handlers
  api/vaults/         vault metadata + ciphertext blob endpoints
  dashboard/          sender app (new vault, vault detail, activity…)
  enclave/            public trust page — enclave identity + receipt verifier
  v/[id]/             recipient unlock page
lib/
  enclave/            the enclave: ecies · identity · policy · attestation ·
                      challenge · engine (+ simulated / remote adapters)
  chain/              viem Coston2 read client + wallet challenge signing
  crypto/             client-side AES-256-GCM content cipher + byte helpers
  repository/         Postgres data access (vaults, blobs, seals)
  db.ts               lazy Postgres client + self-creating schema
components/
  attestation/        AttestationReceipt + the /enclave trust surface
  dashboard/          builder (seal flow), vault cards/detail, sidebar
  unlock/             recipient unlock flow
  ui/ · sections/ · brand/ · mock/   design system + landing
services/             browser-side API + enclave handshake clients
hooks/ · store/ · types/ · utils/    hooks, Zustand state, shared types, helpers
```

### Load-bearing files (for judges)

The Flare integration *is* the product, not a bolt-on. To review it fast, read these seven files:

| File | What to look for |
| --- | --- |
| `lib/enclave/engine.ts` | The `EnclaveEngine` interface + the `ENCLAVE_MODE` switch (simulated ↔ real Coston2). |
| `lib/enclave/simulated.ts` | The seal / unlock protocol, in-enclave policy evaluation, and signed attestation. |
| `lib/enclave/policy.ts` | Every access condition evaluated **inside** the enclave boundary. |
| `lib/enclave/attestation.ts` | ECDSA-signed decision receipts — the "made in the enclave, not by the operator" proof. |
| `lib/chain/coston2.ts` | Live Coston2 reads — ERC-20 balance / ERC-721 ownership for token/NFT gating. |
| `lib/chain/wallet.ts` | The vault-bound challenge + signature recovery that proves wallet control. |
| `app/api/enclave/{seal,unlock,info}/route.ts` | The HTTP boundary the browser talks to. |

---

## Architecture

Every surface is a thin layer over the enclave contract in `lib/enclave/`, which owns key custody,
policy evaluation, and attestation. The app server only ever handles **ciphertext and metadata** —
never the content key.

### The sealed lifecycle

```
SEAL (sender's browser)
  file ──AES-256-GCM──> ciphertext ─────────────> Postgres (ciphertext only)
  content key ──ECIES-wrap to enclave pubkey──> enclave stores {wrapped key, policy}
  share link = /v/<id>              <── no key in the link

UNLOCK (recipient's browser)
  proofs (passphrase / wallet sig / …) ──ECIES-wrap to enclave──> enclave
  enclave evaluates EVERY condition in-boundary
    ├─ fail ─> signed DENIAL (no key released)
    └─ pass ─> content key re-wrapped to recipient  +  ECDSA attestation
  recipient unwraps key, verifies attestation, decrypts file locally
```

**ECIES** = ephemeral ECDH (P-256) → HKDF-SHA256 → AES-256-GCM. **Attestation** = ECDSA P-256 over a
canonical encoding of the decision. All primitives are Web Crypto, so the identical code runs in the
browser and in the enclave runtime.

### The enclave engine

`lib/enclave/engine.ts` exposes one `EnclaveEngine` interface with two implementations, selected by
`ENCLAVE_MODE`:

- **`simulated`** — runs the protocol in-process (the hosted demo). Real ECIES + real attestation on
  ordinary hardware; the enclave identity is persisted in Postgres so it survives serverless cold
  starts.
- **`coston2`** — the same interface pointed at a real Flare Confidential Compute extension over HTTP,
  written to the `fce-sign` op-routing contract (`OP_COMMAND_SEAL` / `OP_COMMAND_UNLOCK`). Switching
  is a config flag, not a rewrite.

---

## Access conditions

Every condition is evaluated **inside the enclave**. Self-contained rules use pure crypto/state;
wallet/token/NFT rules make a live read against Coston2.

| Condition | How the enclave enforces it |
| --- | --- |
| **Passphrase** | PBKDF2 salted hash; verified in-enclave. The server never learns the passphrase. |
| **Expiry** | Deadline sealed at creation; checked against the enclave clock. |
| **Download limit** | Counted against sealed state. |
| **One-time** | Releases exactly once, then denies. |
| **NDA acceptance** | Must be accepted before release. |
| **Wallet** | Recipient signs a **vault-bound challenge**; enclave recovers the address, checks the allow-list. |
| **Token (ERC-20)** | Enclave reads `balanceOf` on Coston2, requires ≥ the sender's threshold. |
| **NFT (ERC-721)** | Enclave reads `balanceOf` / `ownerOf` on Coston2 — any token in the collection, or a specific ID. |

Wallet signing is a plain message signature — **no transaction, no gas.** All chain access is
read-only.

---

## How VaultDrop uses Flare

- **Confidential Compute is the product.** The file key and the access decision live inside the
  enclave; the operator is cryptographically incapable of releasing a key off-policy, and every
  release is attested. The enclave is modeled on Flare's `fce-sign` "Private Key Extension" and
  switches to the real Coston2 extension via config.
- **Coston2 (Flare testnet) for on-chain gating.** Wallet / token / NFT conditions are checked by
  reading Coston2 with [viem](https://viem.sh) (`lib/chain/coston2.ts`) — ERC-20 balances and ERC-721
  ownership, plus a signature-recovery challenge that proves wallet control.
- **VaultDrop deploys no contracts of its own** — it *reads* existing Coston2 token/NFT contracts you
  point conditions at. The default RPC is the public Coston2 endpoint (override with `FLARE_RPC_URL`).

---

## How this maps to the judging criteria

| Criterion | How VaultDrop hits it |
| --- | --- |
| **Product usefulness** | Solves real loss-of-control in file sharing, with a clear commercial user (payment-gated delivery). |
| **Flare integration quality** | Key custody + private policy evaluation *inside* Confidential Compute, plus live Coston2 reads for token/NFT gating. This is the whole product, not a bolt-on. |
| **Technical execution** | One tight, working demo; real client-side encryption; a signed attestation anyone can re-verify; deploy-ready. |
| **Evidence of new work** | The entire enclave + on-chain proof layer was built during the program. |
| **Clarity & future potential** | One-sentence pitch, one beachhead user, credible roadmap. |

---

## Verify it yourself

No fabricated evidence table here — everything is reproducible from the running app:

- **The key is not in the link.** Seal a vault; inspect the share link — it's `/v/<id>` with no key
  fragment. Open it in a fresh browser: it cannot decrypt without satisfying the policy.
- **Wrong proof releases nothing.** Enter the wrong passphrase — the enclave returns a **signed
  denial**, and no key material is sent.
- **The attestation verifies.** On a successful unlock, the receipt's signature is checked in your
  browser. Copy it into **/enclave** and re-verify it against the enclave's published key — tamper
  with a byte and it fails.
- **On-chain checks are live.** With `FLARE_RPC_URL` set (or the default public endpoint), a
  token/NFT condition reads real Coston2 state at unlock time.

---

## What we do NOT claim

- **Not hardware attestation** in the hosted demo — it runs the enclave in **simulated** mode (real
  protocol, ordinary hardware). The real AMD SEV / Coston2 path is wired behind `ENCLAVE_MODE=coston2`
  but requires the FCE extension running plus a Flare indexer credential.
- **Not zero-knowledge / not anonymous** — the server holds ciphertext and metadata, and the fact
  that a vault exists and was unlocked is visible to the operator. What's protected is the **key** and
  the **private policy evaluation** (e.g. the passphrase, the allow-list).
- **Large files** (> 4 MB) are not yet supported on the hosted path — the ciphertext currently uploads
  through a serverless function (Vercel's ~4.5 MB body cap). A signed direct-to-storage upload is the
  documented next step.
- **No automated test suite yet** — correctness is verified via typecheck, lint, and reproducible
  end-to-end crypto/DB checks during development. This is honest hackathon scope.

---

## Verification commands

```bash
pnpm typecheck && pnpm lint && pnpm build   # full gates (build with dev server stopped)
```

---

## Credits and licenses

- **Flare Confidential Compute** — VaultDrop's enclave is modeled on Flare's `fce-sign` "Private Key
  Extension" op-routing contract and the FCC overview. Docs: [dev.flare.network/fcc](https://dev.flare.network/fcc/overview).
- **viem** — Coston2 reads and wallet signature recovery.
- **Next.js 16 · React 19 · Tailwind CSS v4 · TanStack Query · Framer Motion · Zod · shadcn/ui
  conventions** — application stack.
- **Supabase** — hosted Postgres for ciphertext + metadata + the enclave identity.
- The dark "privacy-tech" visual language is adapted from a reference design; see the design notes in
  `PITCH.md` and the repo.

**VaultDrop's bet:** most platforms protect files with passwords. VaultDrop protects them with a key
that only trusted code inside Flare Confidential Compute can ever release.
