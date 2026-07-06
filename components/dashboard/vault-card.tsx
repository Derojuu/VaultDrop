"use client";

import Link from "next/link";
import { useState } from "react";
import { Ban, FileLock2, Link2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { VaultStatusBadge } from "@/components/dashboard/vault-status-badge";
import { CONDITION_META } from "@/lib/conditions";
import { useRevokeVault } from "@/hooks/use-vaults";
import { cn } from "@/lib/utils";
import { formatBytes, formatRelativeTime } from "@/utils/format";
import type { Vault } from "@/types";

export function VaultCard({ vault }: { vault: Vault }) {
  const revoke = useRevokeVault();
  const [copied, setCopied] = useState(false);
  const isDead = vault.status === "revoked" || vault.status === "expired";

  async function copyLink() {
    const url = `https://vaultdrop.app/v/${vault.id.replace("vlt_", "")}`;
    await navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    toast.success("Share link copied");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article
      className={cn(
        "surface-card hover:border-vd-accent/40 flex flex-col gap-4 p-5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5",
        isDead && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-10 shrink-0 place-items-center rounded-[11px] border">
          <FileLock2 className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/vaults/${vault.id}`}
            className="text-vd-tx hover:text-vd-accent2 block truncate text-[15px] font-extrabold tracking-[-0.015em]"
          >
            {vault.name}
          </Link>
          <div className="text-vd-tx3 truncate font-mono text-[11px]">
            {vault.fileName} · {formatBytes(vault.fileSize)}
          </div>
        </div>
        <VaultStatusBadge status={vault.status} />
      </div>

      {/* Conditions */}
      <div className="flex flex-wrap gap-1.5">
        {vault.conditions.map((c) => {
          const meta = CONDITION_META[c.kind];
          const Icon = meta.icon;
          return (
            <span
              key={c.id}
              title={meta.label}
              className="border-vd-bd text-vd-tx2 inline-flex items-center gap-1.5 rounded-[8px] border bg-white/[0.03] px-2 py-1 text-[11px]"
            >
              <Icon className="text-vd-accent2 size-3" />
              {meta.label}
              {c.enclaveEvaluated && (
                <ShieldCheck className="text-vd-pos size-3" />
              )}
            </span>
          );
        })}
      </div>

      <div className="border-vd-bd flex items-center gap-2 border-t pt-3">
        <span className="text-vd-tx3 font-mono text-[10.5px]">
          Updated {formatRelativeTime(vault.updatedAt)}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={copyLink}
            disabled={isDead}
            className="border-vd-bd2 bg-vd-card text-vd-tx hover:border-vd-accent/50 inline-flex items-center gap-1.5 rounded-[9px] border px-2.5 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-40"
          >
            <Link2 className="size-3.5" />
            {copied ? "Copied" : "Share"}
          </button>
          <button
            onClick={() => revoke.mutate(vault.id)}
            disabled={isDead || revoke.isPending}
            aria-label="Revoke vault"
            className="border-vd-bd2 bg-vd-card text-vd-tx3 hover:border-vd-dng/50 hover:text-vd-dng grid size-8 place-items-center rounded-[9px] border transition-colors disabled:opacity-40"
          >
            {revoke.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Ban className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
