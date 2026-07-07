"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileLock2,
  KeyRound,
  Link2,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { isAddress, parseUnits } from "viem";

import { SealingAnimation } from "@/components/dashboard/builder/sealing-animation";
import { Stepper } from "@/components/dashboard/builder/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonoLabel } from "@/components/ui/mono-label";
import { useCreateVault } from "@/hooks/use-vaults";
import { CONDITION_LIST, CONDITION_META } from "@/lib/conditions";
import { MAX_UPLOAD_BYTES, type ConditionKind } from "@/lib/constants";
import { sealFile } from "@/lib/crypto/content-cipher";
import { cn } from "@/lib/utils";
import { uploadCiphertext } from "@/services/blob-store";
import { sealToEnclave } from "@/services/enclave";
import { formatBytes } from "@/utils/format";
import type { AccessCondition, Vault } from "@/types";

const STEPS = ["Upload", "Rules", "Review", "Share"];

interface SealResult {
  vault: Vault;
  link: string;
}

export function VaultBuilder() {
  const create = useCreateVault();
  const [step, setStep] = useState(0);

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<ConditionKind>>(
    new Set(["passphrase"]),
  );
  const [passphrase, setPassphrase] = useState("");
  const [expiryDays, setExpiryDays] = useState("30");
  const [downloadLimit, setDownloadLimit] = useState("2");
  const [walletAllow, setWalletAllow] = useState("");
  const [tokenContract, setTokenContract] = useState("");
  const [tokenMin, setTokenMin] = useState("1");
  const [tokenDecimals, setTokenDecimals] = useState("18");
  const [nftContract, setNftContract] = useState("");
  const [nftTokenId, setNftTokenId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SealResult | null>(null);
  const [sealing, setSealing] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setName((n) => n || f.name.replace(/\.[^.]+$/, ""));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_UPLOAD_BYTES,
    multiple: false,
    onDropRejected: () =>
      toast.error(`File too large — max ${formatBytes(MAX_UPLOAD_BYTES)}`),
  });

  function toggle(kind: ConditionKind) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  function buildConditions(): AccessCondition[] {
    return [...selected].map((kind) => {
      const meta = CONDITION_META[kind];
      let label = meta.label;
      let config: Record<string, unknown> | undefined;
      if (kind === "expiry") {
        label = `Expires in ${expiryDays} days`;
        config = { days: Number(expiryDays) };
      }
      if (kind === "download-limit") {
        label = `Max ${downloadLimit} downloads`;
        config = { max: Number(downloadLimit) };
      }
      if (kind === "wallet") {
        const allow = walletAllow
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        label = `Allowed wallet${allow.length === 1 ? "" : "s"} (${allow.length})`;
        config = { allow };
      }
      if (kind === "token") {
        let minBaseUnits = "1";
        try {
          minBaseUnits = parseUnits(
            tokenMin || "0",
            Number(tokenDecimals) || 18,
          ).toString();
        } catch {
          minBaseUnits = "1";
        }
        label = `Holds ≥ ${tokenMin} token`;
        config = {
          contract: tokenContract.trim(),
          minBaseUnits,
          min: tokenMin,
          decimals: Number(tokenDecimals) || 18,
        };
      }
      if (kind === "nft") {
        const tokenId = nftTokenId.trim();
        label = tokenId ? `Owns NFT #${tokenId}` : "Owns NFT from collection";
        config = { contract: nftContract.trim(), tokenId: tokenId || undefined };
      }
      return { id: kind, kind, label, enclaveEvaluated: meta.enclave, config };
    });
  }

  function next() {
    setError(null);
    if (step === 0) {
      if (!file) return setError("Add a file to continue.");
      if (!name.trim()) return setError("Give the vault a name.");
    }
    if (step === 1) {
      if (selected.size === 0)
        return setError("Add at least one access condition.");
      if (selected.has("passphrase") && passphrase.trim().length < 4)
        return setError("Passphrase must be at least 4 characters.");
      if (selected.has("wallet")) {
        const allow = walletAllow.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
        if (allow.length === 0)
          return setError("Add at least one allowed wallet address.");
        if (!allow.every((a) => isAddress(a)))
          return setError("One or more wallet addresses are invalid.");
      }
      if (selected.has("token") && !isAddress(tokenContract.trim()))
        return setError("Enter a valid token contract address.");
      if (selected.has("nft") && !isAddress(nftContract.trim()))
        return setError("Enter a valid NFT contract address.");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function seal() {
    if (!file) return;
    setSealing(true);
    try {
      // 1. Real client-side encryption — plaintext never leaves the browser.
      const sealed = await sealFile(file);
      const conditions = buildConditions();
      // 2. Record vault metadata (no key, no ciphertext yet). Run alongside a
      //    minimum animation window so the seal sequence is always seen.
      const [vault] = await Promise.all([
        create.mutateAsync({
          name: name.trim(),
          fileName: sealed.name,
          fileSize: sealed.size,
          mimeType: sealed.type,
          conditions,
          ivB64: sealed.ivB64,
          contentHash: sealed.contentHash,
        }),
        new Promise((resolve) => setTimeout(resolve, 2400)),
      ]);
      // 3. Seal the content key into the enclave. The CEK + passphrase are
      //    ECIES-wrapped to the enclave's key in this browser, so the app server
      //    and database never see them — only the enclave can open the envelope.
      await sealToEnclave({
        vaultId: vault.id,
        cekB64Url: sealed.keyB64Url,
        passphrase: selected.has("passphrase") ? passphrase : undefined,
        conditions: conditions.map((c) => ({ kind: c.kind, config: c.config })),
      });
      // 4. Upload ciphertext (Postgres). Ciphertext only — never the key.
      await uploadCiphertext(vault.id, sealed.ciphertext);
      // 5. The link carries ONLY the vault id. The key lives in the enclave and
      //    is released only when the recipient satisfies the policy.
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/v/${vault.id}`;
      setResult({ vault, link });
      setStep(3);
      toast.success("Vault sealed · key sealed in the enclave");
    } catch {
      toast.error("Sealing failed — try again.");
    } finally {
      setSealing(false);
    }
  }

  const enclaveCount = [...selected].filter(
    (k) => CONDITION_META[k].enclave,
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <Stepper steps={STEPS} current={step} />

      <div className="surface p-6 sm:p-8">
        {sealing && <SealingAnimation />}
        {/* Step 1 — Upload */}
        {!sealing && step === 0 && (
          <div className="flex flex-col gap-5">
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-3 rounded-[16px] border border-dashed px-6 py-12 text-center transition-colors",
                isDragActive
                  ? "border-vd-accent/70 bg-vd-accent/[0.06]"
                  : "border-vd-bd2 hover:border-vd-accent/50 hover:bg-white/[0.02]",
              )}
            >
              <input {...getInputProps()} />
              <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-14 place-items-center rounded-[16px] border">
                <UploadCloud className="size-6" />
              </span>
              <div className="text-vd-tx text-[15px] font-bold">
                {isDragActive
                  ? "Drop to encrypt"
                  : "Drag a file, or click to browse"}
              </div>
              <p className="text-vd-tx2 text-[13px]">
                Encrypted on your device · up to {formatBytes(MAX_UPLOAD_BYTES)}
              </p>
            </div>

            {file && (
              <div className="border-vd-bd bg-vd-card flex items-center gap-3 rounded-[12px] border p-3">
                <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-10 shrink-0 place-items-center rounded-[10px] border">
                  <FileLock2 className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-vd-tx truncate text-[13px] font-semibold">
                    {file.name}
                  </div>
                  <div className="text-vd-tx3 font-mono text-[11px]">
                    {formatBytes(file.size)} · AES-256-GCM
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                  className="text-vd-tx3 hover:text-vd-dng grid size-8 place-items-center rounded-[9px] hover:bg-white/[0.05]"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="vault-name">Vault name</Label>
              <Input
                id="vault-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q3 Investor Deck"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Rules */}
        {!sealing && step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-vd-tx text-[17px] font-extrabold tracking-[-0.02em]">
                Access conditions
              </h3>
              <p className="text-vd-tx2 mt-1 text-[13px]">
                Pick the rules a recipient must satisfy. Shielded rules are
                evaluated privately inside the enclave.
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {CONDITION_LIST.map((meta) => {
                const on = selected.has(meta.kind);
                const Icon = meta.icon;
                return (
                  <button
                    key={meta.kind}
                    onClick={() => toggle(meta.kind)}
                    className={cn(
                      "flex items-start gap-3 rounded-[12px] border p-3 text-left transition-colors",
                      on
                        ? "border-vd-accent/50 bg-vd-accent/[0.07]"
                        : "border-vd-bd bg-vd-card hover:border-vd-bd2",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-[9px] border",
                        on
                          ? "border-vd-accent/40 bg-vd-accent/15 text-vd-accent2"
                          : "border-vd-bd bg-vd-card2 text-vd-tx3",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-vd-tx text-[13px] font-semibold">
                          {meta.label}
                        </span>
                        {meta.enclave && (
                          <ShieldCheck className="text-vd-pos size-3" />
                        )}
                      </div>
                      <p className="text-vd-tx3 mt-0.5 text-[11.5px] leading-snug">
                        {meta.hint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {(selected.has("passphrase") ||
              selected.has("expiry") ||
              selected.has("download-limit")) && (
              <div className="border-vd-bd bg-vd-card flex flex-col gap-3 rounded-[12px] border p-4">
                <MonoLabel tone="accent">Rule settings</MonoLabel>
                {selected.has("passphrase") && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="passphrase">Secret passphrase</Label>
                    <Input
                      id="passphrase"
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Only the enclave will verify this"
                    />
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {selected.has("expiry") && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="expiry">Expires after (days)</Label>
                      <Input
                        id="expiry"
                        type="number"
                        min={1}
                        max={365}
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(e.target.value)}
                      />
                    </div>
                  )}
                  {selected.has("download-limit") && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="limit">Max downloads</Label>
                      <Input
                        id="limit"
                        type="number"
                        min={1}
                        max={100}
                        value={downloadLimit}
                        onChange={(e) => setDownloadLimit(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {(selected.has("wallet") ||
              selected.has("token") ||
              selected.has("nft")) && (
              <div className="border-vd-bd bg-vd-card flex flex-col gap-3 rounded-[12px] border p-4">
                <div className="flex items-center gap-1.5">
                  <MonoLabel tone="accent">On-chain rules · Coston2</MonoLabel>
                  <ShieldCheck className="text-vd-pos size-3" />
                </div>

                {selected.has("wallet") && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="wallet-allow">Allowed wallet addresses</Label>
                    <textarea
                      id="wallet-allow"
                      value={walletAllow}
                      onChange={(e) => setWalletAllow(e.target.value)}
                      placeholder="0xabc… , 0xdef…  (comma or newline separated)"
                      rows={2}
                      className="border-vd-bd2 bg-vd-card2 text-vd-tx placeholder:text-vd-tx3 focus:border-vd-accent/60 min-h-[64px] resize-y rounded-[10px] border px-3 py-2 font-mono text-[12px] outline-none"
                    />
                    <p className="text-vd-tx3 text-[11px]">
                      The recipient signs a challenge; the enclave recovers their
                      address and checks this list.
                    </p>
                  </div>
                )}

                {selected.has("token") && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="token-contract">ERC-20 contract</Label>
                    <Input
                      id="token-contract"
                      value={tokenContract}
                      onChange={(e) => setTokenContract(e.target.value)}
                      placeholder="0x… token address on Coston2"
                      className="font-mono text-[12px]"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="token-min">Minimum balance</Label>
                        <Input
                          id="token-min"
                          value={tokenMin}
                          onChange={(e) => setTokenMin(e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="token-decimals">Decimals</Label>
                        <Input
                          id="token-decimals"
                          type="number"
                          min={0}
                          max={36}
                          value={tokenDecimals}
                          onChange={(e) => setTokenDecimals(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selected.has("nft") && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="nft-contract">ERC-721 collection</Label>
                    <Input
                      id="nft-contract"
                      value={nftContract}
                      onChange={(e) => setNftContract(e.target.value)}
                      placeholder="0x… collection address on Coston2"
                      className="font-mono text-[12px]"
                    />
                    <Label htmlFor="nft-token" className="mt-1">
                      Specific token ID (optional)
                    </Label>
                    <Input
                      id="nft-token"
                      value={nftTokenId}
                      onChange={(e) => setNftTokenId(e.target.value)}
                      placeholder="Leave blank to accept any token in the collection"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Review */}
        {!sealing && step === 2 && file && (
          <div className="flex flex-col gap-5">
            <h3 className="text-vd-tx text-[17px] font-extrabold tracking-[-0.02em]">
              Review &amp; seal
            </h3>

            <div className="border-vd-bd bg-vd-card flex items-center gap-3 rounded-[12px] border p-3">
              <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-10 shrink-0 place-items-center rounded-[10px] border">
                <FileLock2 className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="text-vd-tx truncate text-[14px] font-bold">
                  {name}
                </div>
                <div className="text-vd-tx3 truncate font-mono text-[11px]">
                  {file.name} · {formatBytes(file.size)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <MonoLabel>
                {selected.size} conditions · {enclaveCount} enclave-gated
              </MonoLabel>
              <div className="flex flex-col gap-1.5">
                {buildConditions().map((c) => {
                  const Icon = CONDITION_META[c.kind].icon;
                  return (
                    <div
                      key={c.id}
                      className="border-vd-bd bg-vd-card flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5"
                    >
                      <Icon className="text-vd-accent2 size-4" />
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

            <div className="border-vd-accent/30 bg-vd-accent/[0.06] flex items-start gap-2.5 rounded-[12px] border p-3">
              <KeyRound className="text-vd-accent2 mt-0.5 size-4 shrink-0" />
              <p className="text-vd-tx2 text-[12.5px] leading-relaxed">
                On seal, your file is encrypted in-browser with a fresh AES-256
                key. Only ciphertext is stored; the key is sealed inside the
                Flare enclave and released only when a recipient satisfies these
                conditions.
              </p>
            </div>
          </div>
        )}

        {/* Step 4 — Share */}
        {!sealing && step === 3 && result && (
          <ShareResult vault={result.vault} link={result.link} />
        )}

        {/* Footer nav */}
        {!sealing && step < 3 && (
          <div className="border-vd-bd mt-6 flex items-center gap-3 border-t pt-5">
            {error && (
              <span className="text-vd-dng text-[12.5px] font-medium">
                {error}
              </span>
            )}
            <div className="ml-auto flex items-center gap-2.5">
              {step > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setStep((s) => s - 1);
                  }}
                >
                  <ArrowLeft />
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button onClick={next}>
                  Continue
                  <ArrowRight />
                </Button>
              ) : (
                <Button onClick={seal} disabled={create.isPending}>
                  {create.isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Encrypting &amp; sealing…
                    </>
                  ) : (
                    <>
                      <KeyRound />
                      Encrypt &amp; seal
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareResult({ vault, link }: { vault: Vault; link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    toast.success("Secure link copied");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span className="border-vd-pos/40 bg-vd-pos/10 text-vd-pos grid size-14 place-items-center rounded-full border">
        <CheckCircle2 className="size-7" />
      </span>
      <div>
        <h3 className="text-vd-tx text-[20px] font-extrabold tracking-[-0.02em]">
          Vault sealed
        </h3>
        <p className="text-vd-tx2 mt-1.5 max-w-[400px] text-[13.5px] leading-relaxed">
          “{vault.name}” is encrypted and its key is sealed in the enclave. The
          link alone can’t open it — the recipient must satisfy your conditions,
          and the enclave releases the key only then.
        </p>
      </div>

      <div className="grid size-[120px] grid-cols-9 gap-[2px] rounded-[14px] bg-white p-2.5">
        {Array.from({ length: 81 }).map((_, i) => (
          <span
            key={i}
            className={
              (i * 3 + ((i * i) % 7)) % 3 === 0 ? "bg-black" : "bg-transparent"
            }
          />
        ))}
      </div>

      <div className="border-vd-bd2 bg-vd-card2 flex w-full max-w-[460px] items-center gap-2 rounded-[11px] border p-1.5 pl-3.5">
        <Link2 className="text-vd-tx3 size-4 shrink-0" />
        <span className="text-vd-tx2 min-w-0 flex-1 truncate text-left font-mono text-[12px]">
          {link}
        </span>
        <Button size="sm" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {vault.contentHash && (
        <div className="text-vd-tx3 font-mono text-[10.5px]">
          sha-256 · {vault.contentHash.slice(0, 16)}…
        </div>
      )}

      <div className="mt-1 flex items-center gap-2.5">
        <Button asChild variant="secondary">
          <Link href={`/dashboard/vaults/${vault.id}`}>Open vault</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">Done</Link>
        </Button>
      </div>
    </div>
  );
}
