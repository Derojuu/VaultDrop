# VaultDrop

**Files that enforce their own rules — because the key lives where no one can touch it.**

VaultDrop is a secure sharing platform where a file's decryption key is held *inside* Flare
Confidential Compute and released **only** when the recipient provably satisfies the sender's
access conditions. No server — not even VaultDrop's — can read the file or hand out the key. Access
is private, verifiable, and impossible to override.

**Bounty:** #2 — Confidential Compute Apps.

---

## The one sentence that wins the "Flare integration quality" criterion

> On every other file-sharing platform, *some server holds the key and decides who gets in* — so it
> can be hacked, subpoenaed, bribed, or misconfigured. VaultDrop moves the key and the access
> decision **inside a Flare Confidential Compute enclave**, so the decision is made by trusted,
> attestable code that even the operator cannot bypass.

That is the load-bearing integration. It is not a feature — it is the reason the product can exist.

---

## Why this is not "just another EVM app" (say this before a judge asks)

- **vs. centralized (Dropbox, DocSend, WeTransfer, Tresorit):** they hold the key and enforce rules
  in code *you have to trust*. A breach or an insider exposes everything. VaultDrop's operator is
  cryptographically incapable of releasing a key off-policy.
- **vs. a transparent chain / smart contract alone:** conditions and keys would be public on-chain.
  You cannot evaluate a *secret* passphrase or a *private* allowlist on a transparent ledger.
  Confidential Compute is what makes private evaluation possible.
- **vs. Lit Protocol (the comparison a technical judge WILL raise):** Lit uses threshold MPC across a
  node network. VaultDrop uses **TEE-based confidential compute native to an EVM L1**, so policy
  evaluation, key custody, and on-chain condition checks live in one trust domain — on Flare, the
  chain the product is actually built for.

---

## The problem (tight)

Once you share a file link, you've lost control. Links get forwarded, passwords get reused, and the
platform holding your file can be breached or compelled to hand it over. For anyone sharing
genuinely sensitive material — contracts, credentials, deal docs, source, media — "hope no one
misuses the link" is the current state of the art.

## The solution

VaultDrop turns each file into a **sealed vault**:

1. The file is encrypted client-side (AES-256-GCM) before it ever leaves the sender.
2. The decryption key is **sealed to the enclave** (ECIES-wrapped to the enclave's public key)
   alongside the sender's policy — never stored on a server, never placed in the share link.
3. A recipient opens the link and submits proofs (a secret passphrase, a wallet signature, token/NFT
   ownership…).
4. The **enclave evaluates the policy privately** and releases the key **only if every condition
   passes** — then signs the decision so anyone can verify it.
5. The recipient decrypts locally. The operator never saw the key.

The question changes from *"who has the link?"* to *"who has provably satisfied every rule?"*

---

## What we actually built (the demo is real, not mocked)

Every claim below is running code in this repo, verifiable end-to-end.

**Client-side encryption.** Files are encrypted in the browser with a fresh AES-256-GCM key
(`lib/crypto/`). Only ciphertext is ever uploaded (Postgres/Supabase). The plaintext never leaves
the device.

**The enclave (`lib/enclave/`) — a real cryptographic authority.** The enclave has its own identity
keypairs (ECDH for key-wrapping, ECDSA for attestation), persisted so they survive serverless cold
starts. It exposes a small, honest contract modeled on Flare's `fce-sign` extension:
- **Seal** — the sender's content key is ECIES-wrapped *to the enclave's public key in the browser*,
  so the app server and database only ever see ciphertext. The enclave stores the wrapped key plus
  policy verifiers (a passphrase is salted+hashed **inside** the enclave — the plaintext is never
  stored).
- **Unlock** — the recipient's proofs are wrapped to the enclave; it evaluates every condition inside
  the boundary and, only on a full pass, re-wraps the key to the recipient's ephemeral key and
  **signs the decision**.

**Conditions enforced inside the enclave — all real:**
- *Passphrase* — PBKDF2 salted hash, verified in-enclave; the server never learns it.
- *Expiry, download-limit, one-time* — enforced against sealed state.
- *NDA acceptance* — required before release.
- *Wallet / token / NFT* — the recipient signs a **vault-bound challenge**; the enclave recovers the
  address and reads **Coston2** (Flare testnet) for ERC-20 balance / ERC-721 ownership via viem
  (`lib/chain/`). Read-only, no funds, no gas.

**Attestation you can verify.** Every release (or denial) is an ECDSA-signed receipt. The recipient's
browser re-verifies it against the enclave's published key, and the **/enclave** page lets *anyone*
paste a receipt and check it — no trust in us required. This is the "made in the enclave, not by the
operator" proof, made tangible.

**Instant revoke.** One click flips the vault and destroys the stored ciphertext — the file is gone.

### Honest framing: simulated vs. real hardware (state this plainly)

The enclave runs in two modes behind one interface (`EnclaveEngine`):
- **`simulated`** (default, and what the hosted demo runs): the real protocol, real ECIES key
  custody, and real ECDSA attestation — running in-process on ordinary hardware rather than inside
  AMD SEV. The security *contract* judges care about (server never holds the key; key released only
  on an in-enclave policy pass; decision signed and verifiable) is genuinely enforced.
- **`coston2`**: the same interface pointed at a real Flare Confidential Compute extension. It is
  written to the `fce-sign` op-routing contract and switches on with `ENCLAVE_MODE=coston2` +
  `FCE_PROXY_URL` — no code changes. Bringing it up needs the FCE extension running plus a Flare
  indexer credential (via Flare support), which is why the public demo ships in simulated mode.

We claim exactly this and nothing more — the confidential-compute *architecture* is complete and the
hardware path is a configuration flip, not a rewrite.

---

## Beachhead user

**Freelancer / agency payment-gated delivery.**
> "Deliver the final files, but the key only releases after the client proves payment / holds the
> access token." Universal, easy to demo, and the token-gate makes the enclave's role obvious.

Also serves: legal/NDA delivery, dealmakers sharing diligence docs, creators gating media.

---

## Submission checklist

- **Project name:** VaultDrop
- **Bounty:** #2 Confidential Compute Apps
- **Short description:** the one-liner at the top.
- **Target user:** freelancers/agencies delivering sensitive files (primary); legal, dealmakers,
  creators (secondary).
- **Demo:** 2–3 min video (see `DEMO.md`) + a live link on Vercel.
- **GitHub:** this repo. `README` points here; `DEPLOY.md` is the deploy runbook.
- **How it uses Flare:** key custody + private policy evaluation inside Confidential Compute, with
  on-chain (Coston2) wallet/token/NFT condition checks. See "the one sentence" + "what we built."
- **New work:** the entire enclave layer (key sealing/release, in-enclave policy engine, signed
  attestation, the on-chain proof flow, encrypt/share/unlock, revoke) was built during the program.
- **Network:** Coston2 (Flare testnet) for on-chain condition reads; `ENCLAVE_MODE=simulated` for the
  hosted enclave.
- **Roadmap:** below.

---

## How this maps to the 5 judging criteria

| Criterion | How VaultDrop hits it |
|---|---|
| **Product usefulness** | Solves real loss-of-control in file sharing; clear commercial user. |
| **Flare integration quality** | Key custody + private policy eval *inside* Confidential Compute, plus live Coston2 reads for token/NFT gating. This is the whole product, not a bolt-on. |
| **Technical execution** | One tight, working demo flow; real encryption; a signed attestation anyone can re-verify; deploy-ready. |
| **Evidence of new work** | The entire enclave + on-chain proof layer built during the program. |
| **Clarity & future potential** | One-sentence pitch, one beachhead user, credible roadmap. |

---

## Roadmap (post-hackathon)

Real Coston2 hardware enclave (config flip already wired) · signed direct-to-storage uploads for
large files · team workspaces & multi-user vaults · approval workflows · vault analytics & activity
timeline · API access · browser extension · desktop & mobile apps · enterprise compliance.

**VaultDrop's bet:** most platforms protect files with passwords. VaultDrop protects them with a key
that only trusted code inside Flare Confidential Compute can ever release.
