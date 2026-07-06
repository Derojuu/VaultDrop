"use client";

import Link from "next/link";
import {
  Database,
  KeyRound,
  LayoutGrid,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { VaultCard } from "@/components/dashboard/vault-card";
import { Button } from "@/components/ui/button";
import { useVaults } from "@/hooks/use-vaults";
import { formatBytes } from "@/utils/format";

function LoadingGrid() {
  return (
    <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="surface-card shimmer h-[168px] p-5 opacity-70"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="surface flex flex-col items-center gap-4 px-6 py-20 text-center">
      <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-14 place-items-center rounded-[16px] border">
        <KeyRound className="size-6" />
      </span>
      <h2 className="text-vd-tx text-[22px] font-extrabold tracking-[-0.02em]">
        No vaults yet
      </h2>
      <p className="text-vd-tx2 max-w-[380px] text-sm leading-relaxed">
        Seal a file, attach access conditions, and share a link that enforces
        them.
      </p>
      <Button asChild size="lg" className="mt-1">
        <Link href="/dashboard/new">
          <Plus />
          Create your first vault
        </Link>
      </Button>
    </div>
  );
}

export function VaultsView() {
  const { data: vaults, isLoading } = useVaults();

  const stats = {
    total: vaults?.length ?? 0,
    active: vaults?.filter((v) => v.status === "active").length ?? 0,
    enclave:
      vaults?.reduce(
        (n, v) => n + v.conditions.filter((c) => c.enclaveEvaluated).length,
        0,
      ) ?? 0,
    bytes: vaults?.reduce((n, v) => n + v.fileSize, 0) ?? 0,
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      {/* Stats */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total vaults" value={stats.total} icon={LayoutGrid} />
        <StatCard
          label="Active shares"
          value={stats.active}
          icon={ShieldCheck}
          tone="pos"
        />
        <StatCard
          label="Enclave-gated rules"
          value={stats.enclave}
          icon={KeyRound}
        />
        <StatCard
          label="Data sealed"
          value={formatBytes(stats.bytes)}
          icon={Database}
          tone="warn"
        />
      </div>

      {/* Vaults */}
      <div className="flex items-center justify-between">
        <h2 className="text-vd-tx text-[17px] font-extrabold tracking-[-0.02em]">
          Your vaults
        </h2>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/new">
            <Plus />
            New vault
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingGrid />
      ) : vaults && vaults.length > 0 ? (
        <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {vaults.map((v) => (
            <VaultCard key={v.id} vault={v} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
