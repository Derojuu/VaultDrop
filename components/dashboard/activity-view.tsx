"use client";

import Link from "next/link";
import { Activity, Loader2 } from "lucide-react";

import { MonoLabel } from "@/components/ui/mono-label";
import { useEvents } from "@/hooks/use-events";
import { EVENT_META } from "@/lib/event-meta";
import { cn } from "@/lib/utils";
import { formatRelativeTime, truncateMiddle } from "@/utils/format";

export function ActivityView() {
  const { data: events, isLoading } = useEvents();

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
      <div>
        <h1 className="text-vd-tx text-[22px] font-extrabold tracking-[-0.02em]">
          Activity
        </h1>
        <p className="text-vd-tx2 mt-1 text-[13.5px]">
          Every seal, unlock, denial, and revoke — the attested access trail
          across all your vaults.
        </p>
      </div>

      <div className="surface flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <MonoLabel tone="accent">Audit log</MonoLabel>
          {events && events.length > 0 && (
            <span className="text-vd-tx3 font-mono text-[10px] tracking-[0.1em] uppercase">
              {events.length} events
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="text-vd-tx3 flex items-center gap-2 py-8 text-[13px]">
            <Loader2 className="size-4 animate-spin" /> Loading activity…
          </div>
        ) : !events || events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="border-vd-bd2 bg-vd-card2 text-vd-tx3 grid size-12 place-items-center rounded-[14px] border">
              <Activity className="size-5" />
            </span>
            <p className="text-vd-tx2 max-w-[340px] text-[13px] leading-relaxed">
              No activity yet. Seal a vault and share it — every access decision
              the enclave makes will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {events.map((e, i) => {
              const meta = EVENT_META[e.type];
              const Icon = meta.icon;
              const failed = (e.meta?.failed as string[] | undefined) ?? [];
              return (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="border-vd-bd bg-vd-card2 grid size-8 shrink-0 place-items-center rounded-full border">
                      <Icon className={cn("size-3.5", meta.tone)} />
                    </span>
                    {i < events.length - 1 && (
                      <span className="bg-vd-bd my-1 w-px flex-1" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-vd-tx text-[13px] font-semibold">
                        {meta.label}
                      </span>
                      <Link
                        href={`/dashboard/vaults/${e.vaultId}`}
                        className="text-vd-accent2 hover:text-vd-accent max-w-[220px] truncate text-[12px]"
                      >
                        {e.vaultName ?? e.vaultId}
                      </Link>
                    </div>
                    <div className="text-vd-tx3 mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[10.5px]">
                      <span>{formatRelativeTime(e.at)}</span>
                      {e.wallet && (
                        <span className="text-vd-accent2">
                          · {truncateMiddle(e.wallet, 6, 4)}
                        </span>
                      )}
                      {e.type === "denied" && failed.length > 0 && (
                        <span className="text-vd-warn">
                          · failed: {failed.join(", ")}
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
  );
}
