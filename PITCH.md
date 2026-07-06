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
Everything below serves that claim.

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
  evaluation, key custody, and on-chain settlement live in one trust domain — on Flare, the chain the
  product is actually built for. Have this answer ready in the submission.

---

## The problem (tight)

Once you share a file link, you've lost control. Links get forwarded, passwords get reused, and the
platform holding your file can be breached or compelled to hand it over. For anyone sharing
genuinely sensitive material — contracts, credentials, deal docs, source, media — "hope no one
misuses the link" is the current state of the art.

## The solution

VaultDrop turns each file into a **sealed vault**:

1. The file is encrypted client-side before it ever leaves the sender.
2. The decryption key is sealed into **Flare Confidential Compute** alongside the sender's policy.
3. A recipient requests access and submits proofs (wallet signature, secret, token/NFT ownership…).
4. The **enclave evaluates the policy privately** and releases the key **only if every condition
   passes** — attested and logged, without exposing the conditions or the key to any server.
5. The recipient decrypts locally. The operator never saw the key.

The question changes from *"who has the link?"* to *"who has provably satisfied every rule?"*

---

## Hackathon MVP — what we actually build (and demo)

Judges score a **working demo**. We ship ONE flawless flow, not thirty features.

**The spine (must work end-to-end):**
- Client-side encrypt + upload to encrypted object storage.
- Set a small policy combining **at least one TEE-load-bearing condition** — recommended:
  - a **private passphrase** (verified inside the enclave; the server never learns it), AND/OR
  - **wallet / token / NFT ownership** (proof evaluated in the enclave).
- Key sealed into Flare Confidential Compute with the policy.
- Share link → recipient satisfies conditions → **enclave releases key** → local decrypt → download.
- **Instant revoke** — one click invalidates the vault (cheap to build, great "wow" moment).
- A minimal **attestation / access log** proving the decision was made in the enclave, not by us.

**Deliberately deferred to roadmap (mention, do NOT build now):** analytics dashboard, activity
timeline, QR sharing, time capsules, smart security suggestions, team workspaces, multi-user vaults,
approval workflows, browser/desktop/mobile apps, enterprise compliance. Every hour spent here is an
hour stolen from the criterion judges actually score.

> ⚠️ **Verify before building:** confirm exactly what Flare Confidential Compute supports *today*
> (SDK maturity, TEE attestation flow, key-sealing primitives, and which of Coston2 / Songbird /
> Mainnet it's live on) via dev.flare.network before committing to the enclave key-release design.
> If a primitive isn't ready, we adjust the load-bearing feature — but the *positioning* stays.

---

## Pick ONE beachhead user for the demo

Breadth ("freelancers, agencies, startups, enterprises, HR, legal, creators, DAOs, investors…")
reads as unfocused. For the hackathon, lead with **one** concrete story and show it working:

**Recommended: freelancer / agency payment-gated delivery.**
> "Deliver the final files, but the key only releases after the client proves payment / holds the
> access token." Universal, easy to demo, and the payment-gate makes the enclave's role obvious.

Runner-up: **legal/NDA** (key releases only after the recipient signs the NDA condition). Keep the
others as "also serves…" one-liners.

---

## Submission checklist (map directly to their required fields)

- **Project name:** VaultDrop
- **Bounty:** #2 Confidential Compute Apps
- **Short description:** the one-liner at the top.
- **Target user:** freelancers/agencies delivering sensitive files (primary); legal, dealmakers,
  creators (secondary).
- **Demo:** 2–3 min video of the spine flow + a live link on a testnet.
- **GitHub:** clean repo, README = a trimmed version of this doc.
- **How it uses Flare:** the "one sentence that wins" section — key custody + private policy
  evaluation inside Confidential Compute.
- **What was newly built vs. ported/improved:** be explicit and honest (see below).
- **Contract addresses / deployment:** list them; state the network.
- **Roadmap:** the deferred feature list, reframed as a credible product path.
- **Traction (optional but high-leverage):** see plan below.

## New work statement (they reward clear scoping)

State plainly: what existed before the program (if anything), what you newly built during it (the
enclave key-sealing/release, policy evaluation, the encrypt/share/unlock flow, revoke), and what you
integrated on Flare. Even if built from scratch, spell it out — "evidence of new work" is a named
criterion.

## Traction plan (cheap points most teams skip)

Get **3–5 real pilot users** to run one real share before the deadline and give a one-line quote
(a freelancer friend, someone in legal/HR). One slide — "3 pilots, here's what they said" — beats the
majority of submissions that have zero. Budget half a day near the end.

---

## How this maps to the 5 judging criteria (sanity check)

| Criterion | How VaultDrop hits it |
|---|---|
| **Product usefulness** | Solves real loss-of-control in file sharing; clear commercial user. |
| **Flare integration quality** | Key custody + private policy eval *inside* Confidential Compute — impossible without it. This is the whole product, not a bolt-on. |
| **Technical execution** | One tight, working demo flow; visible enclave attestation; live testnet deploy. |
| **Evidence of new work** | Explicit new-work statement; enclave integration built during the program. |
| **Clarity & future potential** | One-sentence pitch, one beachhead user, credible roadmap, pilot users. |

---

## Roadmap (post-hackathon)

Team workspaces & multi-user vaults · approval workflows · digital inheritance / time capsules ·
vault analytics & activity timeline · QR sharing · API access · browser extension · desktop & mobile
apps · enterprise compliance · AI-assisted policy generation.

**VaultDrop's bet:** most platforms protect files with passwords. VaultDrop protects them with a key
that only trusted code inside Flare Confidential Compute can ever release.
