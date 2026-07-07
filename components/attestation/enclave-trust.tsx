"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Cpu,
  FileCheck2,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { StatusPill } from "@/components/ui/status-pill";
import { useEnclaveInfo } from "@/hooks/use-enclave";
import { verifyAttestation } from "@/lib/enclave/attestation";
import { cn } from "@/lib/utils";

function CopyKey({ label, jwk }: { label: string; jwk: JsonWebKey }) {
  const [copied, setCopied] = useState(false);
  const fingerprint = `${jwk.crv ?? "EC"} · ${(jwk.x ?? "").slice(0, 22)}…`;
  async function copy() {
    await navigator.clipboard
      ?.writeText(JSON.stringify(jwk))
      .catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="flex items-center gap-3">
      <span className="text-vd-tx3 w-40 shrink-0 font-mono text-[10px] tracking-[0.08em] uppercase">
        {label}
      </span>
      <span className="text-vd-tx2 min-w-0 flex-1 truncate font-mono text-[11px]">
        {fingerprint}
      </span>
      <button
        onClick={copy}
        className="text-vd-tx3 hover:text-vd-tx inline-flex items-center gap-1 text-[11px] font-medium"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? "Copied" : "Copy JWK"}
      </button>
    </div>
  );
}

const STEPS = [
  {
    icon: Lock,
    title: "Seal",
    body: "The file is encrypted in your browser. Its key is wrapped to the enclave's public key — never stored on a server, never in the link.",
  },
  {
    icon: KeyRound,
    title: "Evaluate",
    body: "On unlock, the recipient's proofs are sent to the enclave, which checks every access condition inside the boundary — passphrase, expiry, wallet, token, NFT.",
  },
  {
    icon: FileCheck2,
    title: "Attest",
    body: "Only if the policy passes does the enclave re-wrap the key to the recipient and sign the decision. Anyone can verify that signature against the key below.",
  },
];

/**
 * The enclave trust content — identity, how-it-works, and the receipt verifier.
 * Rendered both on the public `/enclave` page (with its own standalone header)
 * and inside the dashboard at `/dashboard/enclave` (where the layout supplies
 * the sidebar + topbar). The caller controls the surrounding container width.
 */
export function EnclaveTrustContent() {
  const { data: info, isLoading } = useEnclaveInfo();
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );

  async function verifyPasted() {
    if (!info) return;
    setChecking(true);
    setResult(null);
    try {
      const att = JSON.parse(input);
      if (!att?.claim || !att?.signature) {
        setResult({
          ok: false,
          msg: "That doesn't look like a receipt — it needs a claim and a signature.",
        });
      } else {
        const ok = await verifyAttestation(info.signingPublicJwk, att);
        setResult({
          ok,
          msg: ok
            ? "Valid — this decision was signed by this enclave."
            : "Invalid — the signature does not match this enclave's key.",
        });
      }
    } catch {
      setResult({ ok: false, msg: "Couldn't parse that as JSON." });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="flex flex-col gap-3">
        <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-12 place-items-center rounded-[14px] border">
          <Cpu className="size-6" />
        </span>
        <h1 className="text-vd-tx text-[26px] font-extrabold tracking-[-0.02em]">
          The VaultDrop enclave
        </h1>
        <p className="text-vd-tx2 max-w-[620px] text-[14px] leading-relaxed">
          Every file&apos;s key is sealed to a confidential-compute enclave and
          released only when a recipient provably satisfies your conditions. The
          enclave signs each decision, so no server — not even ours — can release
          a key off-policy without leaving a forgeable-proof trail.
        </p>
      </div>

      {/* Identity */}
      <div className="surface mt-8 flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <MonoLabel tone="accent">Enclave identity</MonoLabel>
          {info && (
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] uppercase",
                info.mode === "coston2"
                  ? "border-vd-pos/30 bg-vd-pos/[0.08] text-vd-pos"
                  : "border-vd-warn/30 bg-vd-warn/[0.08] text-vd-warn",
              )}
            >
              <ShieldCheck className="size-2.5" />
              {info.mode === "coston2" ? "Coston2 hardware" : "simulated"}
            </span>
          )}
        </div>

        {isLoading || !info ? (
          <div className="text-vd-tx3 flex items-center gap-2 text-[13px]">
            <Loader2 className="size-4 animate-spin" /> Loading enclave
            identity…
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-vd-tx3 w-40 shrink-0 font-mono text-[10px] tracking-[0.08em] uppercase">
                Code measurement
              </span>
              <span className="text-vd-tx min-w-0 flex-1 truncate font-mono text-[11px]">
                {info.measurement}
              </span>
            </div>
            <CopyKey label="Encryption key" jwk={info.encryptionPublicJwk} />
            <CopyKey label="Signing key" jwk={info.signingPublicJwk} />
            <p className="text-vd-tx3 border-vd-bd border-t pt-3 text-[11.5px] leading-relaxed">
              The <span className="text-vd-tx2">measurement</span> identifies the
              exact enclave build.{" "}
              {info.mode === "coston2"
                ? "On Coston2 it is the attested hardware code-hash."
                : "In simulated mode it is the software build tag — the same protocol and crypto, without the hardware root of trust."}
            </p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="surface flex flex-col gap-2.5 p-5">
              <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-9 place-items-center rounded-[10px] border">
                <Icon className="size-4" />
              </span>
              <div className="text-vd-tx text-[14px] font-bold">{s.title}</div>
              <p className="text-vd-tx3 text-[12px] leading-relaxed">{s.body}</p>
            </div>
          );
        })}
      </div>

      {/* Receipt verifier */}
      <div className="surface mt-6 flex flex-col gap-3 p-6">
        <MonoLabel tone="accent">Verify a receipt</MonoLabel>
        <p className="text-vd-tx2 text-[13px] leading-relaxed">
          Paste an attestation receipt (the JSON from any unlock) to check its
          signature against this enclave — no trust in us required.
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{ "claim": { … }, "signature": "…" }'
          rows={5}
          className="border-vd-bd2 bg-vd-card2 text-vd-tx placeholder:text-vd-tx3 focus:border-vd-accent/60 min-h-[120px] resize-y rounded-[10px] border px-3 py-2.5 font-mono text-[11.5px] outline-none"
        />
        <div className="flex items-center gap-3">
          <Button onClick={verifyPasted} disabled={!input.trim() || checking}>
            {checking ? (
              <>
                <Loader2 className="animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <ShieldCheck />
                Verify signature
              </>
            )}
          </Button>
          {result && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[12.5px] font-medium",
                result.ok ? "text-vd-pos" : "text-vd-dng",
              )}
            >
              {result.ok ? (
                <ShieldCheck className="size-4" />
              ) : (
                <ShieldX className="size-4" />
              )}
              {result.msg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The public, standalone trust page at `/enclave` — its own minimal header so
 * anyone (including judges) can verify a receipt without signing in.
 */
export function EnclaveTrust() {
  const { data: info } = useEnclaveInfo();
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="glass-pill mx-auto mt-4 flex w-[min(880px,calc(100%-2rem))] items-center gap-4 py-2.5 pr-2.5 pl-4">
        <Link href="/" aria-label="VaultDrop home">
          <Logo />
        </Link>
        <StatusPill tone="pos" className="ml-auto">
          {info ? `enclave · ${info.mode}` : "enclave"}
        </StatusPill>
      </header>

      <div className="mx-auto w-full max-w-[880px] flex-1 px-4 py-10">
        <EnclaveTrustContent />
      </div>
    </main>
  );
}
