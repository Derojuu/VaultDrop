"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Ban,
  Cpu,
  FileLock2,
  Link2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { VaultStatusBadge } from "@/components/dashboard/vault-status-badge";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { useEnclaveInfo } from "@/hooks/use-enclave";
import { useEvents } from "@/hooks/use-events";
import { useRevokeVault, useVault } from "@/hooks/use-vaults";
import { CONDITION_META } from "@/lib/conditions";
import { EVENT_META } from "@/lib/event-meta";
import { cn } from "@/lib/utils";
import { formatBytes, formatRelativeTime, truncateMiddle } from "@/utils/format";

export function VaultDetail({ id }: { id: string }) {
  const { data: vault, isLoading } = useVault(id);
  const { data: enclave } = useEnclaveInfo();
  const { data: events } = useEvents(id);
  const revoke = useRevokeVault();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="surface shimmer mx-auto h-[320px] w-full max-w-[860px] opacity-70" />
    );
  }

  if (!vault) {
    return (
      <div className="surface mx-auto flex w-full max-w-[860px] flex-col items-center gap-4 px-6 py-20 text-center">
        <h1 className="text-vd-tx text-[20px] font-extrabold">
          Vault not found
        </h1>
        <Button asChild variant="secondary">
          <Link href="/dashboard">
            <ArrowLeft />
            Back to vaults
          </Link>
        </Button>
      </div>
    );
  }

  const feed = events ?? [];
  const isDead = vault.status === "revoked" || vault.status === "expired";
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/v/${vault.id}`
      : `/v/${vault.id}`;

  async function copyLink() {
    await navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    toast.success("Share link copied");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/dashboard">
          <ArrowLeft />
          All vaults
        </Link>
      </Button>

      {/* Header */}
      <div className="surface flex flex-col gap-5 p-6">
        <div className="flex items-start gap-4">
          <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-12 shrink-0 place-items-center rounded-[13px] border">
            <FileLock2 className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-vd-tx text-[22px] font-extrabold tracking-[-0.02em]">
                {vault.name}
              </h1>
              <VaultStatusBadge status={vault.status} />
            </div>
            <div className="text-vd-tx3 mt-1 truncate font-mono text-[12px]">
              {vault.fileName} · {formatBytes(vault.fileSize)}
              {vault.sealRef && <> · {vault.sealRef}</>}
            </div>
          </div>
        </div>

        <div className="border-vd-bd flex flex-wrap items-center gap-2.5 border-t pt-4">
          <Button
            onClick={copyLink}
            disabled={isDead}
            variant="secondary"
            size="sm"
          >
            <Link2 />
            {copied ? "Copied" : "Copy share link"}
          </Button>
          <Button
            onClick={() => revoke.mutate(vault.id)}
            disabled={isDead || revoke.isPending}
            variant="ghost"
            size="sm"
            className="text-vd-tx2 hover:text-vd-dng"
          >
            {revoke.isPending ? <Loader2 className="animate-spin" /> : <Ban />}
            Revoke access
          </Button>
        </div>
      </div>

      {/* Enclave custody */}
      <div className="surface flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
        <div className="flex items-center gap-2.5">
          <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-9 shrink-0 place-items-center rounded-[10px] border">
            <Cpu className="size-4" />
          </span>
          <div className="leading-tight">
            <div className="text-vd-tx text-[13px] font-bold">
              Key sealed in enclave
            </div>
            <div className="text-vd-tx3 font-mono text-[10.5px]">
              {enclave
                ? `${enclave.mode} · ${enclave.measurement.slice(0, 16)}…`
                : "loading identity…"}
            </div>
          </div>
        </div>
        {vault.sealRef && (
          <div className="leading-tight">
            <MonoLabel>Seal ref</MonoLabel>
            <div className="text-vd-tx2 mt-1 font-mono text-[11px]">
              {vault.sealRef}
            </div>
          </div>
        )}
        <Link
          href="/enclave"
          className="text-vd-accent2 hover:text-vd-accent ml-auto text-[12px] font-medium"
        >
          Verify the enclave →
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Conditions */}
        <div className="surface flex flex-col gap-3 p-6">
          <MonoLabel tone="accent">Access policy</MonoLabel>
          <div className="flex flex-col gap-2">
            {vault.conditions.map((c) => {
              const meta = CONDITION_META[c.kind];
              const Icon = meta.icon;
              return (
                <div
                  key={c.id}
                  className="border-vd-bd bg-vd-card flex items-center gap-3 rounded-[11px] border px-3 py-2.5"
                >
                  <span className="border-vd-bd bg-vd-card2 text-vd-accent2 grid size-8 shrink-0 place-items-center rounded-[8px] border">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-vd-tx text-[13px]">{c.label}</span>
                  {c.enclaveEvaluated && (
                    <span className="text-vd-pos ml-auto inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.1em] uppercase">
                      <ShieldCheck className="size-3" /> Enclave
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity timeline */}
        <div className="surface flex flex-col gap-3 p-6">
          <MonoLabel tone="accent">Activity</MonoLabel>
          {feed.length === 0 ? (
            <p className="text-vd-tx3 text-[13px]">No activity yet.</p>
          ) : (
            <div className="flex flex-col">
              {feed.map((e, i) => {
                const meta = EVENT_META[e.type];
                const Icon = meta.icon;
                return (
                  <div key={e.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="border-vd-bd bg-vd-card2 grid size-8 shrink-0 place-items-center rounded-full border">
                        <Icon className={cn("size-3.5", meta.tone)} />
                      </span>
                      {i < feed.length - 1 && (
                        <span className="bg-vd-bd my-1 w-px flex-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="text-vd-tx text-[13px] font-semibold">
                        {meta.label}
                      </div>
                      <div className="text-vd-tx3 font-mono text-[10.5px]">
                        {formatRelativeTime(e.at)}
                        {e.wallet && (
                          <span className="text-vd-accent2">
                            {" "}
                            · {truncateMiddle(e.wallet, 6, 4)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
