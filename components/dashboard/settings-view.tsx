"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  KeyRound,
  Loader2,
  Lock,
  Network,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { StatusPill } from "@/components/ui/status-pill";
import { connectWallet } from "@/lib/chain/wallet";
import { FLARE_NETWORKS, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { env } from "@/lib/env";
import { useEnclaveInfo } from "@/hooks/use-enclave";
import { cn } from "@/lib/utils";
import { formatBytes, truncateMiddle } from "@/utils/format";

/** A labelled key/value row inside a settings card. */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-vd-tx3 w-40 shrink-0 pt-0.5 font-mono text-[10px] tracking-[0.08em] uppercase">
        {label}
      </span>
      <div className="text-vd-tx2 min-w-0 flex-1 text-[12.5px]">{children}</div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
  aside,
}: {
  icon: typeof Cpu;
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="surface flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2.5">
        <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-8 shrink-0 place-items-center rounded-[9px] border">
          <Icon className="size-4" />
        </span>
        <MonoLabel tone="accent">{title}</MonoLabel>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function SettingsView() {
  const { data: info, isLoading } = useEnclaveInfo();
  const net = FLARE_NETWORKS[env.NEXT_PUBLIC_FLARE_NETWORK];

  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  async function onConnect() {
    setConnecting(true);
    try {
      setWallet(await connectWallet());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't connect a wallet.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
      <div>
        <h1 className="text-vd-tx text-[22px] font-extrabold tracking-[-0.02em]">
          Settings
        </h1>
        <p className="text-vd-tx2 mt-1 text-[13.5px]">
          The live security posture of this deployment. Everything here is read
          from the running app — no stored profile, nothing simulated.
        </p>
      </div>

      {/* Enclave */}
      <Card
        icon={Cpu}
        title="Enclave"
        aside={
          info && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] uppercase",
                info.mode === "coston2"
                  ? "border-vd-pos/30 bg-vd-pos/[0.08] text-vd-pos"
                  : "border-vd-warn/30 bg-vd-warn/[0.08] text-vd-warn",
              )}
            >
              <ShieldCheck className="size-2.5" />
              {info.mode === "coston2" ? "Coston2 hardware" : "simulated"}
            </span>
          )
        }
      >
        {isLoading || !info ? (
          <div className="text-vd-tx3 flex items-center gap-2 text-[13px]">
            <Loader2 className="size-4 animate-spin" /> Loading enclave identity…
          </div>
        ) : (
          <>
            <Row label="Mode">
              {info.mode === "coston2"
                ? "Real Flare Confidential Compute extension"
                : "In-process software enclave (real protocol, ordinary hardware)"}
            </Row>
            <Row label="Code measurement">
              <span className="text-vd-tx block truncate font-mono text-[11px]">
                {info.measurement}
              </span>
            </Row>
            <div className="border-vd-bd border-t pt-3">
              <Link
                href="/dashboard/enclave"
                className="text-vd-accent2 hover:text-vd-accent text-[12px] font-medium"
              >
                Inspect keys &amp; verify a receipt →
              </Link>
            </div>
          </>
        )}
      </Card>

      {/* Network */}
      <Card
        icon={Network}
        title="Flare network"
        aside={<StatusPill tone="pos">{net.label}</StatusPill>}
      >
        <Row label="Network">
          {net.label} · {net.kind}
        </Row>
        <Row label="Chain ID">
          <span className="font-mono text-[11.5px]">{net.id}</span>
        </Row>
        <Row label="RPC endpoint">
          <span className="text-vd-tx break-all font-mono text-[11px]">
            {net.rpc}
          </span>
        </Row>
        <Row label="Explorer">
          <a
            href={net.explorer}
            target="_blank"
            rel="noreferrer"
            className="text-vd-accent2 hover:text-vd-accent break-all font-mono text-[11px]"
          >
            {net.explorer}
          </a>
        </Row>
        <p className="text-vd-tx3 border-vd-bd border-t pt-3 text-[11.5px] leading-relaxed">
          The network is set at deploy time (<span className="font-mono">
            NEXT_PUBLIC_FLARE_NETWORK
          </span>
          ). Wallet / token / NFT conditions read this chain — read-only, no
          transactions, no gas.
        </p>
      </Card>

      {/* Encryption */}
      <Card icon={Lock} title="Encryption defaults">
        <Row label="File contents">
          <span className="text-vd-tx">AES-256-GCM</span> — encrypted in your
          browser before upload; the server only ever stores ciphertext.
        </Row>
        <Row label="Key sealing">
          <span className="text-vd-tx">ECIES</span> — ephemeral ECDH (P-256) →
          HKDF-SHA256 → AES-256-GCM, wrapping the content key to the enclave.
        </Row>
        <Row label="Attestation">
          <span className="text-vd-tx">ECDSA (P-256)</span> over a canonical
          encoding of each release/deny decision.
        </Row>
        <Row label="Max upload">
          <span className="font-mono text-[11.5px]">
            {formatBytes(MAX_UPLOAD_BYTES)}
          </span>{" "}
          per file on the hosted path.
        </Row>
        <p className="text-vd-tx3 border-vd-bd border-t pt-3 text-[11.5px] leading-relaxed">
          These primitives are fixed in code (<span className="font-mono">
            lib/crypto
          </span>{" "}
          and <span className="font-mono">lib/enclave</span>) — the same
          protocol runs in the browser and the enclave.
        </p>
      </Card>

      {/* Wallet */}
      <Card
        icon={Wallet}
        title="Wallet"
        aside={
          wallet ? (
            <StatusPill tone="pos">Connected</StatusPill>
          ) : undefined
        }
      >
        {wallet ? (
          <Row label="Address">
            <span className="text-vd-tx font-mono text-[11.5px]">
              {truncateMiddle(wallet, 12, 8)}
            </span>
          </Row>
        ) : (
          <Button
            onClick={onConnect}
            disabled={connecting}
            variant="secondary"
            size="sm"
            className="w-fit"
          >
            {connecting ? <Loader2 className="animate-spin" /> : <KeyRound />}
            Connect wallet
          </Button>
        )}
        <p className="text-vd-tx3 border-vd-bd border-t pt-3 text-[11.5px] leading-relaxed">
          Connecting is only a signature check — it proves which address you
          control when unlocking a wallet-, token-, or NFT-gated vault. VaultDrop
          never initiates a transaction and never holds funds.
        </p>
      </Card>
    </div>
  );
}
