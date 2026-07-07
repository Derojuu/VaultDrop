"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  FileLock2,
  Info,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AttestationReceipt } from "@/components/attestation/attestation-receipt";
import {
  connectWallet,
  GET_WALLET_URL,
  signUnlockChallenge,
} from "@/lib/chain/wallet";
import type { Attestation } from "@/lib/enclave/attestation";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonoLabel } from "@/components/ui/mono-label";
import { StatusPill } from "@/components/ui/status-pill";
import { useMounted } from "@/hooks/use-mounted";
import { useVault } from "@/hooks/use-vaults";
import { useWalletAvailable } from "@/hooks/use-wallet-available";
import { CONDITION_META } from "@/lib/conditions";
import { sha256Hex } from "@/lib/crypto/bytes";
import { openSealedFile } from "@/lib/crypto/content-cipher";
import { cn } from "@/lib/utils";
import { downloadCiphertext } from "@/services/blob-store";
import { unlockViaEnclave } from "@/services/enclave";
import type { PolicyResult } from "@/lib/enclave/types";
import { formatBytes } from "@/utils/format";

type Integrity = "ok" | "mismatch" | null;
type Phase = "idle" | "verifying" | "done";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="glass-pill mx-auto mt-4 flex w-[min(760px,calc(100%-2rem))] items-center gap-4 py-2.5 pr-2.5 pl-4">
        <Link href="/" aria-label="VaultDrop home">
          <Logo />
        </Link>
        <StatusPill tone="pos" className="ml-auto">
          Coston2
        </StatusPill>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[460px]">{children}</div>
      </div>
    </main>
  );
}

export function VaultUnlock({ id }: { id: string }) {
  const { data: vault, isLoading } = useVault(id);
  const mounted = useMounted();
  const [phase, setPhase] = useState<Phase>("idle");
  const [passphrase, setPassphrase] = useState("");
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [results, setResults] = useState<PolicyResult[]>([]);
  const [attestation, setAttestation] = useState<Attestation | null>(null);
  const [integrity, setIntegrity] = useState<Integrity>(null);
  const [err, setErr] = useState<string | null>(null);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const needsPassphrase = !!vault?.conditions.some(
    (c) => c.kind === "passphrase",
  );
  const needsNda = !!vault?.conditions.some((c) => c.kind === "nda");
  const needsWallet = !!vault?.conditions.some((c) =>
    ["wallet", "token", "nft"].includes(c.kind),
  );
  const walletAvailable = useWalletAvailable();
  const noWallet = walletAvailable === false && !walletAddr;

  async function connect() {
    setErr(null);
    setConnecting(true);
    try {
      setWalletAddr(await connectWallet());
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setConnecting(false);
    }
  }

  async function unlock() {
    if (!vault || !vault.ivB64) return;
    setErr(null);
    setResults([]);
    setIntegrity(null);

    // Prove wallet ownership up front (MetaMask prompt) if the policy needs it.
    let walletProofs: {
      walletAddress?: string;
      walletSignature?: string;
    } = {};
    if (needsWallet) {
      if (!walletAddr) {
        setErr("Connect your wallet to continue.");
        return;
      }
      try {
        walletProofs = {
          walletAddress: walletAddr,
          walletSignature: await signUnlockChallenge(vault.id, walletAddr),
        };
      } catch {
        setErr("Wallet signature was rejected.");
        return;
      }
    }

    setPhase("verifying");

    // Let the enclave scanline breathe before the verdict lands.
    await sleep(650);

    try {
      const outcome = await unlockViaEnclave({
        vaultId: vault.id,
        proofs: {
          passphrase: needsPassphrase ? passphrase : undefined,
          ndaAccepted: needsNda ? ndaAccepted : undefined,
          ...walletProofs,
        },
      });

      setResults(outcome.results);
      setAttestation(outcome.attestation);

      if (!outcome.granted) {
        const failed = outcome.results.find((r) => !r.ok);
        setErr(failed?.message ?? "The enclave denied access under this policy.");
        setPhase("idle");
        return;
      }
      if (!outcome.attestationVerified || !outcome.cekB64Url) {
        setErr(
          "The enclave's attestation didn't verify — refusing to trust the released key.",
        );
        setPhase("idle");
        return;
      }

      let ciphertext: ArrayBuffer | null;
      try {
        ciphertext = await downloadCiphertext(vault.id);
      } catch {
        setErr(
          "This vault has been revoked — the file is no longer available.",
        );
        setPhase("idle");
        return;
      }
      if (!ciphertext) {
        setErr(
          "The encrypted file isn't available. Make sure the vault finished sealing.",
        );
        setPhase("idle");
        return;
      }

      const plaintext = await openSealedFile(
        ciphertext,
        vault.ivB64,
        outcome.cekB64Url,
      );

      if (vault.contentHash) {
        const hash = await sha256Hex(plaintext);
        setIntegrity(hash === vault.contentHash ? "ok" : "mismatch");
      }

      const out = new Blob([plaintext], {
        type: vault.mimeType || "application/octet-stream",
      });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = vault.fileName || "vaultdrop-download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setPhase("done");
      toast.success("Unlocked & downloaded");
    } catch (e) {
      const status = (e as { status?: number }).status;
      setErr(
        status === 410
          ? "This vault has been revoked — the file is no longer available."
          : "Couldn't complete the unlock — please try again.",
      );
      setPhase("idle");
    }
  }

  if (isLoading || !mounted) {
    return (
      <Shell>
        <div className="surface text-vd-tx2 flex items-center justify-center gap-3 p-10">
          <Loader2 className="size-5 animate-spin" /> Loading vault…
        </div>
      </Shell>
    );
  }

  if (!vault) {
    return (
      <Shell>
        <div className="surface flex flex-col items-center gap-3 p-10 text-center">
          <ShieldAlert className="text-vd-warn size-8" />
          <h1 className="text-vd-tx text-[18px] font-extrabold">
            Vault not found
          </h1>
          <p className="text-vd-tx2 text-[13px]">
            This link doesn&apos;t point to a known vault, or it was revoked.
          </p>
        </div>
      </Shell>
    );
  }

  const verifying = phase === "verifying";
  const done = phase === "done";
  const resultByKind = new Map(results.map((r) => [r.kind, r]));
  const canSubmit =
    (!needsPassphrase || passphrase.trim().length > 0) &&
    (!needsNda || ndaAccepted) &&
    (!needsWallet || !!walletAddr);

  return (
    <Shell>
      <div className="surface flex flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-11 shrink-0 place-items-center rounded-[12px] border">
            <FileLock2 className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-vd-tx truncate text-[17px] font-extrabold tracking-[-0.02em]">
              {vault.name}
            </h1>
            <div className="text-vd-tx3 truncate font-mono text-[11px]">
              {vault.fileName} · {formatBytes(vault.fileSize)}
            </div>
          </div>
        </div>

        {/* Proof inputs — what the recipient must supply to satisfy the policy */}
        {!done && (needsPassphrase || needsNda || needsWallet) && (
          <div className="border-vd-bd bg-vd-card flex flex-col gap-3 rounded-[12px] border p-4">
            <MonoLabel tone="accent">Prove access</MonoLabel>
            {needsWallet && (
              <div className="flex flex-col gap-1.5">
                <Label>Wallet</Label>
                {walletAddr ? (
                  <div className="border-vd-pos/30 bg-vd-pos/[0.05] flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5">
                    <Wallet className="text-vd-pos size-4 shrink-0" />
                    <span className="text-vd-tx truncate font-mono text-[12px]">
                      {walletAddr.slice(0, 6)}…{walletAddr.slice(-4)}
                    </span>
                    <button
                      onClick={connect}
                      disabled={verifying || connecting}
                      className="text-vd-tx3 hover:text-vd-tx ml-auto text-[11px] font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : noWallet ? (
                  <div className="border-vd-warn/30 bg-vd-warn/[0.05] flex flex-col gap-2.5 rounded-[10px] border px-3 py-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="text-vd-warn mt-0.5 size-4 shrink-0" />
                      <p className="text-vd-tx2 text-[12px] leading-relaxed">
                        This vault is gated on a wallet, but no browser wallet is
                        installed. You&apos;ll need one to prove ownership and
                        unlock.
                      </p>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="w-fit">
                      <a href={GET_WALLET_URL} target="_blank" rel="noreferrer">
                        <Download />
                        Get a wallet
                      </a>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={connect}
                    disabled={connecting || verifying}
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      <>
                        <Wallet />
                        Connect wallet
                      </>
                    )}
                  </Button>
                )}
                <p className="text-vd-tx3 text-[11px] leading-relaxed">
                  You&apos;ll sign a message to prove ownership — no transaction,
                  no gas. The enclave verifies it on Coston2.
                </p>
              </div>
            )}
            {needsPassphrase && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="unlock-pass">Passphrase</Label>
                <Input
                  id="unlock-pass"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Verified inside the enclave"
                  disabled={verifying}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canSubmit && !verifying) unlock();
                  }}
                />
              </div>
            )}
            {needsNda && (
              <label className="text-vd-tx2 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-relaxed">
                <input
                  type="checkbox"
                  checked={ndaAccepted}
                  onChange={(e) => setNdaAccepted(e.target.checked)}
                  disabled={verifying}
                  className="accent-vd-accent mt-0.5 size-4 shrink-0"
                />
                I accept the non-disclosure terms for this file.
              </label>
            )}
          </div>
        )}

        {/* Conditions — driven by the enclave's real per-condition verdicts */}
        <div className="relative flex flex-col gap-2 overflow-hidden rounded-[12px]">
          <div className="flex items-center justify-between">
            <MonoLabel>Access policy</MonoLabel>
            <span className="text-vd-tx3 font-mono text-[9px] tracking-[0.1em] uppercase">
              {verifying ? "enclave · evaluating" : "enclave-enforced"}
            </span>
          </div>

          {verifying && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-[1] h-10 bg-[linear-gradient(180deg,transparent,rgba(94,124,250,0.14),transparent)]"
              animate={{ top: ["-10%", "100%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {vault.conditions.map((c) => {
            const meta = CONDITION_META[c.kind];
            const Icon = meta.icon;
            const r = resultByKind.get(c.kind);
            return (
              <div
                key={c.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 transition-colors",
                  r && !r.ok
                    ? "border-vd-dng/40 bg-vd-dng/[0.06]"
                    : "border-vd-bd bg-vd-card",
                )}
              >
                <Icon className="text-vd-accent2 size-4" />
                <span className="text-vd-tx text-[13px]">{c.label}</span>
                <span className="ml-auto grid size-4 place-items-center">
                  {verifying && !r ? (
                    <Loader2 className="text-vd-accent2 size-3.5 animate-spin" />
                  ) : r ? (
                    r.status === "deferred" ? (
                      <Info
                        className="text-vd-tx3 size-3.5"
                        aria-label={r.message}
                      />
                    ) : r.ok ? (
                      <motion.span
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                      >
                        <CheckCircle2 className="text-vd-pos size-4" />
                      </motion.span>
                    ) : (
                      <XCircle className="text-vd-dng size-4" />
                    )
                  ) : c.enclaveEvaluated ? (
                    <ShieldCheck className="text-vd-pos/70 size-3.5" />
                  ) : (
                    <span className="status-dot" data-tone="warn" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {err && (
          <p className="border-vd-dng/30 bg-vd-dng/[0.07] text-vd-dng rounded-[10px] border px-3 py-2.5 text-[12.5px] leading-relaxed">
            {err}
          </p>
        )}

        {/* Attestation surface — the signed, re-verifiable enclave decision */}
        {attestation && (
          <AttestationReceipt attestation={attestation} defaultOpen={done} />
        )}

        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-vd-pos/30 bg-vd-pos/[0.06] flex flex-col items-center gap-2 rounded-[12px] border p-5 text-center"
          >
            <motion.span
              initial={{ scale: 0.4, rotate: -8 }}
              animate={{ scale: [0.4, 1.15, 1], rotate: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              className="border-vd-pos/40 bg-vd-pos/10 text-vd-pos grid size-11 place-items-center rounded-full border"
            >
              <Lock className="size-5" />
            </motion.span>
            <div className="text-vd-tx text-[14px] font-bold">
              Decrypted &amp; downloaded
            </div>
            {integrity === "ok" && (
              <div className="text-vd-pos inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.08em] uppercase">
                <ShieldCheck className="size-3" /> Integrity verified
              </div>
            )}
            {integrity === "mismatch" && (
              <div className="text-vd-warn inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.08em] uppercase">
                <ShieldAlert className="size-3" /> Hash mismatch
              </div>
            )}
          </motion.div>
        ) : (
          <Button
            size="lg"
            onClick={unlock}
            disabled={verifying || !canSubmit}
          >
            {verifying ? (
              <>
                <Loader2 className="animate-spin" />
                Verifying in enclave…
              </>
            ) : (
              <>
                <Download />
                Unlock &amp; download
              </>
            )}
          </Button>
        )}

        <p className="text-vd-tx3 text-center text-[11px] leading-relaxed">
          The key is sealed in the enclave and released only on a passing policy
          check. Decryption happens in your browser — the key never persists on a
          server.{" "}
          <Link
            href="/enclave"
            className="text-vd-accent2 hover:text-vd-accent font-medium"
          >
            How the enclave works →
          </Link>
        </p>
      </div>
    </Shell>
  );
}
