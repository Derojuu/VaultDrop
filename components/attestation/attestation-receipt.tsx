"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import { useEnclaveInfo } from "@/hooks/use-enclave";
import { verifyAttestation, type Attestation } from "@/lib/enclave/attestation";
import { cn } from "@/lib/utils";

type Verify = "idle" | "checking" | "ok" | "bad";

/**
 * Renders a signed enclave decision and lets anyone re-verify its signature
 * against the enclave's published key — the visible, checkable proof that the
 * key release (or denial) came from the measured enclave, not a server.
 */
export function AttestationReceipt({
  attestation,
  defaultOpen = false,
  className,
}: {
  attestation: Attestation;
  defaultOpen?: boolean;
  className?: string;
}) {
  const { data: info } = useEnclaveInfo();
  const [verify, setVerify] = useState<Verify>("checking");
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const claim = attestation.claim;
  const granted = claim.decision === "granted";

  // Independently re-verify as soon as the enclave key is available. The result
  // lands in the async callback, so no state is set synchronously in the effect.
  useEffect(() => {
    if (!info) return;
    let cancelled = false;
    verifyAttestation(info.signingPublicJwk, attestation).then((ok) => {
      if (!cancelled) setVerify(ok ? "ok" : "bad");
    });
    return () => {
      cancelled = true;
    };
  }, [info, attestation]);

  async function runVerify() {
    if (!info) return;
    setVerify("checking");
    const ok = await verifyAttestation(info.signingPublicJwk, attestation);
    setVerify(ok ? "ok" : "bad");
  }

  async function copy() {
    await navigator.clipboard
      ?.writeText(JSON.stringify(attestation, null, 2))
      .catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      className={cn(
        "border-vd-bd bg-vd-card flex flex-col gap-3 rounded-[12px] border p-4",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <BadgeCheck className="text-vd-accent2 size-4 shrink-0" />
        <span className="text-vd-tx text-[13px] font-bold">
          Enclave attestation
        </span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] uppercase",
            granted
              ? "border-vd-pos/30 bg-vd-pos/[0.08] text-vd-pos"
              : "border-vd-warn/30 bg-vd-warn/[0.08] text-vd-warn",
          )}
        >
          {claim.decision}
        </span>
      </div>

      {/* Live signature verification */}
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5",
          verify === "ok"
            ? "border-vd-pos/30 bg-vd-pos/[0.05]"
            : verify === "bad"
              ? "border-vd-dng/30 bg-vd-dng/[0.06]"
              : "border-vd-bd bg-vd-card2",
        )}
      >
        {verify === "checking" || verify === "idle" ? (
          <Loader2 className="text-vd-accent2 size-4 animate-spin" />
        ) : verify === "ok" ? (
          <ShieldCheck className="text-vd-pos size-4" />
        ) : (
          <ShieldX className="text-vd-dng size-4" />
        )}
        <div className="min-w-0 leading-tight">
          <div className="text-vd-tx text-[12px] font-semibold">
            {verify === "ok"
              ? "Signature verified"
              : verify === "bad"
                ? "Signature invalid"
                : "Verifying signature…"}
          </div>
          <div className="text-vd-tx3 text-[10.5px]">
            Checked in your browser against the enclave&apos;s published key.
          </div>
        </div>
        {(verify === "ok" || verify === "bad") && (
          <button
            onClick={runVerify}
            className="text-vd-tx3 hover:text-vd-tx ml-auto text-[11px] font-medium"
          >
            Re-verify
          </button>
        )}
      </div>

      {/* Identity line */}
      <div className="flex items-center gap-2 font-mono text-[10.5px]">
        <span className="text-vd-tx3">enclave</span>
        <span className="border-vd-bd bg-vd-card2 text-vd-tx2 rounded-full border px-1.5 py-0.5">
          {claim.mode}
        </span>
        <span className="text-vd-tx3">measurement</span>
        <span className="text-vd-tx2 truncate">
          {claim.measurement.slice(0, 18)}…
        </span>
      </div>

      {/* Details toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-vd-tx3 hover:text-vd-tx flex items-center gap-1 text-[11.5px] font-medium"
      >
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
        {open ? "Hide" : "Show"} receipt details
      </button>

      {open && (
        <div className="flex flex-col gap-2.5 border-t border-vd-bd pt-3">
          <Field label="Vault" value={claim.vaultId} mono />
          <Field label="Recipient key" value={claim.recipientKeyHash} mono truncate />
          <Field label="Measurement" value={claim.measurement} mono truncate />
          <Field label="Issued" value={claim.issuedAt} mono />
          <div className="flex flex-col gap-1.5">
            <span className="text-vd-tx3 font-mono text-[10px] tracking-[0.08em] uppercase">
              Policy results
            </span>
            <div className="flex flex-col gap-1">
              {claim.policyResults.map((r, i) => (
                <div
                  key={`${r.kind}-${i}`}
                  className="flex items-center gap-2 text-[12px]"
                >
                  {r.ok ? (
                    <Check className="text-vd-pos size-3.5" />
                  ) : (
                    <ShieldX className="text-vd-dng size-3.5" />
                  )}
                  <span className="text-vd-tx2">{r.kind}</span>
                  <span className="text-vd-tx3 ml-auto font-mono text-[9.5px] tracking-[0.08em] uppercase">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={copy}
              className="text-vd-accent2 hover:text-vd-accent inline-flex items-center gap-1.5 text-[11.5px] font-medium"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied receipt" : "Copy receipt"}
            </button>
            <Link
              href="/enclave"
              className="text-vd-tx3 hover:text-vd-tx text-[11.5px] font-medium"
            >
              What is this? →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-vd-tx3 w-24 shrink-0 font-mono text-[10px] tracking-[0.08em] uppercase">
        {label}
      </span>
      <span
        className={cn(
          "text-vd-tx2 min-w-0 text-[12px]",
          mono && "font-mono text-[11px]",
          truncate && "truncate",
        )}
      >
        {value}
      </span>
    </div>
  );
}
