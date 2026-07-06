/**
 * Hero device-showcase mockups.
 *
 * Built at native desktop size and scaled down with a CSS transform (the same
 * technique the reference uses with iframes) so they read as crisp product
 * screenshots instead of cramped tiny UI. They mirror the real VaultDrop
 * dashboard / share / unlock surfaces.
 */
import {
  Activity,
  Ban,
  CheckCircle2,
  Clock,
  Download,
  FileLock2,
  Fingerprint,
  LayoutGrid,
  Link2,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";

function Dot({ tone = "pos" }: { tone?: "pos" | "warn" | "accent" }) {
  return <span className="status-dot" data-tone={tone} aria-hidden />;
}

function LogoDial({ size = 22 }: { size?: number }) {
  return (
    <span
      className="relative inline-block shrink-0 rounded-full bg-[linear-gradient(135deg,#8a9bff,#5e7cfa)]"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-[3px] rounded-full bg-[#161826]" />
      <span className="absolute top-1/2 left-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9aa6ff]" />
    </span>
  );
}

/** Fixed-size frame that scales native-size children down to fit. */
export function ScaledScreen({
  w,
  h,
  scale,
  className,
  children,
}: {
  w: number;
  h: number;
  scale: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("mock-screen", className)}
      style={{ width: Math.round(w * scale), height: Math.round(h * scale) }}
    >
      <div
        style={{
          width: w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================ Web dashboard ============================ */
export function WebDashboard() {
  const nav: [typeof LayoutGrid, string, boolean][] = [
    [LayoutGrid, "Vaults", true],
    [Activity, "Activity", false],
    [Link2, "Shares", false],
    [Users, "Recipients", false],
  ];
  const recent: [string, "pos" | "accent" | "warn"][] = [
    ["Q3 Investor Deck", "pos"],
    ["Design Handoff", "pos"],
    ["Mutual NDA", "accent"],
  ];

  return (
    <div className="bg-vd-bg text-vd-tx flex h-full w-full font-sans">
      {/* Sidebar */}
      <aside className="border-vd-bd bg-vd-side flex w-[210px] shrink-0 flex-col gap-3 border-r p-4">
        <div className="flex items-center gap-2">
          <LogoDial size={24} />
          <span className="text-[15px] font-extrabold tracking-[-0.02em]">
            VaultDrop
          </span>
        </div>
        <span className="border-vd-bd2 text-vd-tx2 inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[8px] tracking-[0.12em]">
          <Dot /> TESTNET
        </span>
        <div className="bg-vd-accent flex items-center justify-center gap-1.5 rounded-[10px] py-2.5 text-[12px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(94,124,250,0.8)]">
          <Plus className="size-3.5" /> New vault
        </div>
        <nav className="mt-1 flex flex-col gap-0.5">
          {nav.map(([Icon, label, active], i) => (
            <div
              key={i}
              className={cn(
                "relative flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[12.5px] font-medium",
                active
                  ? "text-vd-tx bg-[linear-gradient(90deg,rgba(94,124,250,0.18),rgba(94,124,250,0.03))] font-semibold"
                  : "text-vd-tx2",
              )}
            >
              {active && (
                <span className="bg-vd-accent absolute top-2 bottom-2 left-0 w-[2.5px] rounded-full" />
              )}
              <Icon className={cn("size-4", active && "text-vd-accent2")} />
              {label}
            </div>
          ))}
        </nav>
        <span className="text-vd-tx3 mt-1 px-1 font-mono text-[9px] tracking-[0.14em]">
          RECENT VAULTS
        </span>
        <div className="flex flex-col gap-0.5">
          {recent.map(([name, tone], i) => (
            <div
              key={i}
              className="text-vd-tx2 flex items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[12px]"
            >
              <Dot tone={tone} /> <span className="truncate">{name}</span>
            </div>
          ))}
        </div>
        <div className="border-vd-bd bg-vd-card mt-auto flex items-center gap-2 rounded-[10px] border p-2">
          <LogoDial size={22} />
          <div className="leading-tight">
            <div className="text-[11.5px] font-semibold">Personal</div>
            <div className="text-vd-tx3 font-mono text-[9px]">0x9x…7p4a</div>
          </div>
          <ShieldCheck className="text-vd-pos ml-auto size-3.5" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <div className="border-vd-bd flex h-[52px] shrink-0 items-center gap-3 border-b px-5">
          <div className="text-[15px] font-extrabold tracking-[-0.02em]">
            Vaults
          </div>
          <div className="border-vd-bd bg-vd-card2 text-vd-tx3 ml-auto flex items-center gap-2 rounded-[9px] border px-2.5 py-1.5">
            <Search className="size-3.5" />
            <span className="text-[11px]">Search vaults…</span>
          </div>
          <span className="border-vd-bd text-vd-tx2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[9px] tracking-[0.06em]">
            <Dot /> COSTON2
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <div className="text-[20px] font-extrabold tracking-[-0.025em]">
              Vaults
            </div>
            <div className="text-vd-tx3 mt-0.5 text-[11px]">
              Sealed transfers · policy enforced in-enclave
            </div>
          </div>

          {/* Featured sealed vault — tri-part focal card */}
          <div className="border-vd-bd2 relative flex h-[236px] overflow-hidden rounded-[20px] border shadow-[0_30px_70px_-40px_#000]">
            {/* Sealed key */}
            <div className="hatch relative flex flex-[1.5] flex-col bg-[linear-gradient(150deg,rgba(94,124,250,0.28),rgba(94,124,250,0.04)_70%)] p-6">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[linear-gradient(90deg,rgba(255,255,255,0.22),transparent)]"
                style={{ animation: "zkSheen 5.5s ease-in-out infinite" }}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-vd-accent2 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em]">
                  <span className="border-vd-accent2 size-2 rotate-45 border-[1.5px]" />
                  SEALED KEY
                </span>
                <span className="border-vd-accent/50 bg-vd-accent/15 text-vd-accent2 rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-[0.12em]">
                  PRIVATE
                </span>
              </div>
              <div className="relative mt-auto">
                <div className="font-mono text-[36px] leading-none font-extrabold tracking-[-0.03em] text-white">
                  Q3-Deck.pdf
                </div>
                <div className="mt-3 flex items-center gap-4 font-mono text-[10px]">
                  <span className="text-vd-pos inline-flex items-center gap-1.5">
                    <Dot /> 4.2 MB · AES-256
                  </span>
                  <span className="text-vd-warn inline-flex items-center gap-1.5">
                    <Dot tone="warn" /> ENCLAVE HELD
                  </span>
                </div>
              </div>
            </div>

            {/* Access boundary */}
            <div className="border-vd-warn/40 bg-vd-warn/[0.05] flex w-[92px] shrink-0 flex-col items-center justify-center gap-3 border-x border-dashed">
              <span className="text-vd-warn/80 text-center font-mono text-[8px] leading-tight tracking-[0.1em]">
                ACCESS
                <br />
                BOUNDARY
              </span>
              {(
                [
                  [Link2, "Share"],
                  [QrCode, "QR"],
                  [Ban, "Revoke"],
                ] as [typeof Link2, string][]
              ).map(([I, label], i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="border-vd-bd2 bg-vd-card2 text-vd-tx grid size-8 place-items-center rounded-full border">
                    <I className="size-3.5" />
                  </span>
                  <span className="text-vd-tx3 text-[8px]">{label}</span>
                </div>
              ))}
            </div>

            {/* Conditions */}
            <div className="flex flex-1 flex-col bg-[linear-gradient(150deg,rgba(229,180,92,0.06),transparent_60%)] p-5">
              <span className="text-vd-tx3 font-mono text-[9px] tracking-[0.12em]">
                3 CONDITIONS
              </span>
              <div className="mt-3 flex flex-col gap-2">
                {(
                  [
                    [Wallet, "Token holder"],
                    [Fingerprint, "Passphrase"],
                    [Clock, "Expires 30d"],
                  ] as [typeof Wallet, string][]
                ).map(([I, label], i) => (
                  <div
                    key={i}
                    className="border-vd-bd bg-vd-card flex items-center gap-2 rounded-[9px] border px-2.5 py-2"
                  >
                    <span className="border-vd-bd text-vd-accent2 grid size-6 place-items-center rounded-[7px] border bg-white/[0.03]">
                      <I className="size-3" />
                    </span>
                    <span className="text-vd-tx2 text-[11px]">{label}</span>
                    <ShieldCheck className="text-vd-pos ml-auto size-3" />
                  </div>
                ))}
              </div>
              <div className="bg-vd-accent mt-auto flex items-center justify-center gap-1.5 rounded-[9px] py-2 text-[11px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(94,124,250,0.8)]">
                <Link2 className="size-3" /> Share link
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <span className="bg-vd-accent inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[11px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(94,124,250,0.8)]">
              <Link2 className="size-3" /> Share privately
            </span>
            <span className="border-vd-bd2 bg-vd-card text-vd-tx inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[11px] font-semibold">
              <Plus className="size-3" /> Add rule
            </span>
            <span className="border-vd-bd2 bg-vd-card text-vd-tx inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[11px] font-semibold">
              <Activity className="size-3" /> Activity
            </span>
            <span className="border-vd-bd2 bg-vd-card text-vd-tx3 ml-auto inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[11px] font-semibold">
              <Ban className="size-3" /> Revoke
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================== Share ================================= */
export function ShareCard() {
  return (
    <div className="bg-vd-panel text-vd-tx flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center font-sans">
      <span className="border-vd-pos/40 bg-vd-pos/10 text-vd-pos grid size-12 place-items-center rounded-full border">
        <CheckCircle2 className="size-6" />
      </span>
      <div>
        <div className="text-[18px] font-extrabold tracking-[-0.02em]">
          Vault sealed
        </div>
        <div className="text-vd-tx2 mt-1 text-[11.5px] leading-relaxed">
          Share the link — the key rides in its # fragment.
        </div>
      </div>

      <div className="grid size-[132px] grid-cols-11 gap-[2px] rounded-[14px] bg-white p-3">
        {Array.from({ length: 121 }).map((_, i) => (
          <span
            key={i}
            className={
              (i * 5 + ((i * i) % 9)) % 3 === 0 ? "bg-black" : "bg-transparent"
            }
          />
        ))}
      </div>

      <div className="border-vd-bd2 bg-vd-card2 flex w-full items-center gap-2 rounded-[11px] border p-1.5 pl-3">
        <Link2 className="text-vd-tx3 size-3.5 shrink-0" />
        <span className="text-vd-tx2 min-w-0 flex-1 truncate text-left font-mono text-[11px]">
          vaultdrop.app/v/9xQ…7p4a
        </span>
        <span className="bg-vd-accent rounded-[8px] px-3 py-1.5 text-[11px] font-bold text-white">
          Copy
        </span>
      </div>

      <div className="flex w-full flex-col gap-1.5">
        {(
          [
            [ShieldCheck, "NDA required", "pos"],
            [Clock, "One-time access", "warn"],
          ] as [typeof ShieldCheck, string, "pos" | "warn"][]
        ).map(([I, label, tone], i) => (
          <div
            key={i}
            className="border-vd-bd bg-vd-card flex items-center gap-2 rounded-[9px] border px-3 py-2"
          >
            <I className="text-vd-accent2 size-3.5" />
            <span className="text-vd-tx2 text-[11.5px]">{label}</span>
            <span className="ml-auto">
              <Dot tone={tone} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== Unlock =============================== */
export function UnlockCard() {
  const steps: [typeof Wallet, string, "done" | "active" | "todo"][] = [
    [Wallet, "Wallet verified", "done"],
    [Fingerprint, "Enter passphrase", "active"],
    [ShieldCheck, "Accept NDA", "todo"],
  ];
  return (
    <div className="bg-vd-panel text-vd-tx flex h-full w-full flex-col gap-4 p-6 font-sans">
      <div className="flex items-center gap-3">
        <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-11 place-items-center rounded-[12px] border">
          <FileLock2 className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-extrabold tracking-[-0.02em]">
            Q3 Investor Deck
          </div>
          <div className="text-vd-tx3 font-mono text-[10px]">
            q3-deck.pdf · 4.2 MB
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-vd-tx3 font-mono text-[9px] tracking-[0.14em]">
          ACCESS POLICY
        </span>
        <span className="text-vd-tx3 font-mono text-[8px] tracking-[0.1em] uppercase">
          in-enclave
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {steps.map(([Icon, label, state], i) => {
          const done = state === "done";
          const active = state === "active";
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5",
                active
                  ? "border-vd-accent/45 bg-vd-accent/10"
                  : "border-vd-bd bg-vd-card",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  done ? "text-vd-pos" : "text-vd-accent2",
                )}
              />
              <span className="text-vd-tx text-[12px]">{label}</span>
              <span className="ml-auto">
                <Dot tone={done ? "pos" : active ? "accent" : "warn"} />
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-vd-accent mt-auto flex items-center justify-center gap-2 rounded-[11px] py-3 text-[13px] font-bold text-white shadow-[0_14px_28px_-12px_rgba(94,124,250,0.8)]">
        <Download className="size-4" /> Unlock &amp; download
      </div>
      <p className="text-vd-tx3 text-center text-[9.5px] leading-relaxed">
        Decryption happens in your browser. The key never touches a server.
      </p>
    </div>
  );
}
