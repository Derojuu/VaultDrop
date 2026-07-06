"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  FileLock2,
  KeyRound,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { StatusPill } from "@/components/ui/status-pill";
import { useMounted } from "@/hooks/use-mounted";
import { useVault } from "@/hooks/use-vaults";
import { CONDITION_META } from "@/lib/conditions";
import { sha256Hex } from "@/lib/crypto/bytes";
import { openSealedFile } from "@/lib/crypto/content-cipher";
import { cn } from "@/lib/utils";
import { getBlob } from "@/services/blob-store";
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
  const [verified, setVerified] = useState(0);
  const [integrity, setIntegrity] = useState<Integrity>(null);
  const [err, setErr] = useState<string | null>(null);

  const keyB64 = mounted
    ? new URLSearchParams(window.location.hash.slice(1)).get("k")
    : null;

  async function unlock() {
    if (!vault || !keyB64 || !vault.ivB64) return;
    setErr(null);
    setVerified(0);
    setPhase("verifying");

    // Walk the conditions as if the enclave is checking each in turn.
    for (let i = 0; i < vault.conditions.length; i++) {
      await sleep(560);
      setVerified(i + 1);
    }
    await sleep(360);

    try {
      const blob = await getBlob(vault.id);
      if (!blob) {
        setErr(
          "The encrypted file isn't reachable from this browser yet — remote storage lands in Step 3. For now, unlock from the same browser that sealed it.",
        );
        setPhase("idle");
        return;
      }
      const plaintext = await openSealedFile(
        blob.ciphertext,
        blob.ivB64,
        keyB64,
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
    } catch {
      setErr(
        "Couldn't decrypt — the key in the link may be wrong or the link is corrupted.",
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

  if (!keyB64) {
    return (
      <Shell>
        <div className="surface flex flex-col items-center gap-3 p-10 text-center">
          <KeyRound className="text-vd-warn size-8" />
          <h1 className="text-vd-tx text-[18px] font-extrabold">
            This link is missing its key
          </h1>
          <p className="text-vd-tx2 text-[13px]">
            The decryption key travels in the link&apos;s{" "}
            <span className="text-vd-accent2 font-mono">#</span> fragment. Use
            the full link exactly as it was shared with you.
          </p>
        </div>
      </Shell>
    );
  }

  const verifying = phase === "verifying";
  const done = phase === "done";

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

        {/* Conditions — checked one-by-one by the "enclave" */}
        <div className="relative flex flex-col gap-2 overflow-hidden rounded-[12px]">
          <div className="flex items-center justify-between">
            <MonoLabel>Access policy</MonoLabel>
            <span className="text-vd-tx3 font-mono text-[9px] tracking-[0.1em] uppercase">
              {verifying ? "enclave · verifying" : "enclave check · Step 4"}
            </span>
          </div>

          {verifying && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-[1] h-10 bg-[linear-gradient(180deg,transparent,rgba(94,124,250,0.14),transparent)]"
              animate={{ top: ["-10%", "100%"] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {vault.conditions.map((c, i) => {
            const meta = CONDITION_META[c.kind];
            const Icon = meta.icon;
            const isDone = phase !== "idle" && i < verified;
            const isChecking = verifying && i === verified;
            return (
              <div
                key={c.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 transition-colors",
                  isChecking
                    ? "border-vd-accent/45 bg-vd-accent/[0.08]"
                    : "border-vd-bd bg-vd-card",
                )}
              >
                <Icon className="text-vd-accent2 size-4" />
                <span className="text-vd-tx text-[13px]">{c.label}</span>
                <span className="ml-auto grid size-4 place-items-center">
                  {isDone ? (
                    <motion.span
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                      <CheckCircle2 className="text-vd-pos size-4" />
                    </motion.span>
                  ) : isChecking ? (
                    <Loader2 className="text-vd-accent2 size-3.5 animate-spin" />
                  ) : phase === "idle" && c.enclaveEvaluated ? (
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
            <Button
              variant="ghost"
              size="sm"
              className="mt-1"
              onClick={() => setPhase("idle")}
            >
              Download again
            </Button>
          </motion.div>
        ) : (
          <Button size="lg" onClick={unlock} disabled={verifying}>
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
          Decryption happens entirely in your browser. The key never touches a
          server.
        </p>
      </div>
    </Shell>
  );
}
