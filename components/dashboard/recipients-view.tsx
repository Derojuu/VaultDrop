"use client";

import { Loader2, Users, Wallet } from "lucide-react";

import { MonoLabel } from "@/components/ui/mono-label";
import { StatusPill } from "@/components/ui/status-pill";
import { useRecipients } from "@/hooks/use-events";
import { formatRelativeTime, pluralize, truncateMiddle } from "@/utils/format";

export function RecipientsView() {
  const { data: recipients, isLoading } = useRecipients();

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
      <div>
        <h1 className="text-vd-tx text-[22px] font-extrabold tracking-[-0.02em]">
          Recipients
        </h1>
        <p className="text-vd-tx2 mt-1 text-[13.5px]">
          Wallets the enclave has cryptographically identified when unlocking
          your wallet-, token-, or NFT-gated vaults.
        </p>
      </div>

      {/* Honest privacy note — most unlocks are anonymous by design. */}
      <div className="border-vd-accent/30 bg-vd-accent/[0.05] text-vd-tx2 flex items-start gap-2.5 rounded-[12px] border px-4 py-3 text-[12.5px] leading-relaxed">
        <Wallet className="text-vd-accent2 mt-0.5 size-4 shrink-0" />
        <p>
          Only <strong className="text-vd-tx">proven wallet addresses</strong>{" "}
          appear here — the recipient signed a challenge and the enclave
          recovered the address. Passphrase- or expiry-only unlocks are
          anonymous and never recorded with an identity.
        </p>
      </div>

      <div className="surface flex flex-col gap-3 p-6">
        <MonoLabel tone="accent">Identified recipients</MonoLabel>

        {isLoading ? (
          <div className="text-vd-tx3 flex items-center gap-2 py-8 text-[13px]">
            <Loader2 className="size-4 animate-spin" /> Loading recipients…
          </div>
        ) : !recipients || recipients.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="border-vd-bd2 bg-vd-card2 text-vd-tx3 grid size-12 place-items-center rounded-[14px] border">
              <Users className="size-5" />
            </span>
            <p className="text-vd-tx2 max-w-[360px] text-[13px] leading-relaxed">
              No identified recipients yet. When someone unlocks a wallet-gated
              vault, their proven address shows up here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recipients.map((r) => (
              <div
                key={r.wallet}
                className="border-vd-bd bg-vd-card flex items-center gap-3 rounded-[11px] border px-3 py-3"
              >
                <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-9 shrink-0 place-items-center rounded-[10px] border">
                  <Wallet className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-vd-tx truncate font-mono text-[12.5px]">
                    {truncateMiddle(r.wallet, 10, 8)}
                  </div>
                  <div className="text-vd-tx3 font-mono text-[10.5px]">
                    last seen {formatRelativeTime(r.lastAt)} ·{" "}
                    {pluralize(r.vaultIds.length, "vault")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill tone="pos">
                    {r.unlocks} {r.unlocks === 1 ? "unlock" : "unlocks"}
                  </StatusPill>
                  {r.denials > 0 && (
                    <StatusPill tone="warn">{r.denials} denied</StatusPill>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
