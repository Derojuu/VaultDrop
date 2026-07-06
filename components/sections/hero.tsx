import Link from "next/link";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { DeviceShowcase } from "@/components/sections/device-showcase";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      aria-label="VaultDrop — files that enforce their own rules"
      className="mx-auto mt-4.5 w-[min(1240px,calc(100%-2rem))] text-center"
    >
      <div className="relative flex min-h-[640px] flex-col items-center overflow-hidden rounded-[28px] border border-white/10 bg-[#08090b] px-6 pt-[72px] pb-0 shadow-[0_60px_140px_-80px_#000] sm:px-10">
        {/* The VaultDrop mark, giant and slowly rotating like a vault dial */}
        <span
          aria-hidden
          style={{ animation: "zkCoinTurn 90s linear infinite" }}
          className="pointer-events-none absolute bottom-0 left-1/2 aspect-square w-[min(1180px,150vw)] opacity-[0.55] drop-shadow-[0_0_150px_rgba(94,124,250,0.5)]"
        >
          <LogoMark className="size-full" />
        </span>
        {/* soft accent glow pooled behind the mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 size-[720px] -translate-x-1/2 translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(94,124,250,0.25),transparent_62%)] blur-[10px]"
        />
        {/* top fade so content stays legible */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(#08090be6_6%,#08090b73_44%,#08090b00_78%)]"
        />

        <div className="relative z-[2] mx-auto max-w-[860px] animate-[zkRise_0.7s_cubic-bezier(0.2,0.7,0.2,1)_both]">
          <h1 className="text-[clamp(42px,6.2vw,72px)] leading-[0.98] font-extrabold tracking-[-0.03em] text-white [text-shadow:0_10px_60px_rgba(8,8,16,0.55)]">
            Every file
            <br />
            <em className="text-shimmer bg-[linear-gradient(100deg,#8a9bff,#9aa6ff,#ffffff,#9aa6ff,#8a9bff)] bg-clip-text text-transparent not-italic">
              enforces its own rules.
            </em>
          </h1>

          <p className="text-vd-tx2 mx-auto mt-6 max-w-[560px] text-[16px] leading-relaxed">
            VaultDrop seals a file&apos;s decryption key inside a Flare enclave
            and releases it only when the recipient provably satisfies your
            conditions. Not even we can open it.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="sheen relative overflow-hidden"
            >
              <Link href="/dashboard">
                Create a vault
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#how">
                <ShieldCheck />
                See how sealing works
              </a>
            </Button>
          </div>

          <div className="text-vd-tx3 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase">
              <KeyRound className="text-vd-accent2 size-3.5" />
              Key never leaves the enclave
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase">
              <ShieldCheck className="text-vd-pos size-3.5" />
              Attested access decisions
            </span>
          </div>
        </div>

        {/* Product mockups rising out of the hero floor */}
        <div className="relative z-[1] mt-auto w-full">
          <DeviceShowcase />
        </div>
      </div>
    </section>
  );
}
