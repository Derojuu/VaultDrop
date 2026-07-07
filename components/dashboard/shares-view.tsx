"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, Check, Copy, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { VaultStatusBadge } from "@/components/dashboard/vault-status-badge";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { useRevokeVault, useVaults } from "@/hooks/use-vaults";
import { CONDITION_META } from "@/lib/conditions";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";

export function SharesView() {
  const { data: vaults, isLoading } = useVaults();

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-5">
      <div>
        <h1 className="text-vd-tx text-[22px] font-extrabold tracking-[-0.02em]">
          Share links
        </h1>
        <p className="text-vd-tx2 mt-1 text-[13.5px]">
          Every vault is a share link. Copy it, watch its policy, and revoke
          access in one click — the key is released only by the enclave.
        </p>
      </div>

      {isLoading ? (
        <div className="surface text-vd-tx3 flex items-center gap-2 p-10 text-[13px]">
          <Loader2 className="size-4 animate-spin" /> Loading share links…
        </div>
      ) : !vaults || vaults.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="border-vd-bd2 bg-vd-card2 text-vd-tx3 grid size-12 place-items-center rounded-[14px] border">
            <Link2 className="size-5" />
          </span>
          <p className="text-vd-tx2 max-w-[340px] text-[13px] leading-relaxed">
            No share links yet. Seal your first vault to create one.
          </p>
          <Button asChild size="sm" className="mt-1">
            <Link href="/dashboard/new">New vault</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vaults.map((v) => (
            <ShareRow key={v.id} vaultId={v.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShareRow({ vaultId }: { vaultId: string }) {
  const { data: vaults } = useVaults();
  const vault = vaults?.find((v) => v.id === vaultId);
  const revoke = useRevokeVault();
  const [copied, setCopied] = useState(false);

  if (!vault) return null;

  const isDead = vault.status === "revoked" || vault.status === "expired";
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/v/${vault.id}`
      : `/v/${vault.id}`;

  async function copy() {
    await navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    toast.success("Share link copied");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      className={cn(
        "surface flex flex-col gap-3 p-5",
        isDead && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/dashboard/vaults/${vault.id}`}
              className="text-vd-tx hover:text-vd-accent2 truncate text-[15px] font-bold tracking-[-0.01em]"
            >
              {vault.name}
            </Link>
            <VaultStatusBadge status={vault.status} />
          </div>
          <div className="text-vd-tx3 mt-1 truncate font-mono text-[11px]">
            {link}
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="flex flex-wrap gap-1.5">
        {vault.conditions.map((c) => {
          const Icon = CONDITION_META[c.kind].icon;
          return (
            <span
              key={c.id}
              className="border-vd-bd bg-vd-card text-vd-tx2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]"
            >
              <Icon className="text-vd-accent2 size-3" />
              {c.label}
            </span>
          );
        })}
      </div>

      <div className="border-vd-bd flex flex-wrap items-center gap-2.5 border-t pt-3">
        <MonoLabel>Created {formatRelativeTime(vault.createdAt)}</MonoLabel>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={copy} disabled={isDead} variant="secondary" size="sm">
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button
            onClick={() => revoke.mutate(vault.id)}
            disabled={isDead || revoke.isPending}
            variant="ghost"
            size="sm"
            className="text-vd-tx2 hover:text-vd-dng"
          >
            {revoke.isPending ? <Loader2 className="animate-spin" /> : <Ban />}
            Revoke
          </Button>
        </div>
      </div>
    </div>
  );
}
