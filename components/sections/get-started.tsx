import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";

import { ScaledScreen, ShareCard, UnlockCard } from "@/components/mock/mocks";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

/**
 * Two-path "get started" grid — mirrors the reference "get" section:
 * gradient cards with copy + a product screenshot peeking from the corner.
 */
export function GetStarted() {
  return (
    <section
      id="get"
      className="mx-auto w-[min(1180px,calc(100%-2.5rem))] scroll-mt-24 pt-24"
    >
      <SectionHeading
        eyebrow="Two sides of a vault"
        title="Seal it once. They prove their way in."
      />

      <Stagger className="mt-11 grid gap-4.5 md:grid-cols-2">
        {/* Senders */}
        <StaggerItem>
          <article className="relative min-h-[320px] overflow-hidden rounded-[24px] border border-white/12 bg-[radial-gradient(120%_130%_at_82%_-10%,rgba(123,92,255,0.55),transparent_60%),radial-gradient(110%_120%_at_10%_110%,rgba(94,124,250,0.5),transparent_62%),linear-gradient(160deg,#191a2e,#101018_70%)] p-[30px] shadow-[0_50px_110px_-60px_#000]">
            <div className="relative z-[1] flex max-w-[58%] flex-col items-start gap-3.5">
              <span className="text-vd-accent2 font-mono text-[10.5px] font-bold tracking-[0.12em] uppercase">
                For senders
              </span>
              <h3 className="text-[25px] font-extrabold tracking-[-0.02em] text-white">
                Upload, set rules, share
              </h3>
              <p className="text-sm leading-relaxed text-white/80">
                Encrypt a file, attach conditions, and get a link or QR that
                enforces them. Revoke everything in one click.
              </p>
              <Link
                href="/dashboard"
                className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0a0b0db8] px-4 py-2.5 text-[13px] font-bold text-white backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                <Upload className="size-3.5" />
                Create a vault
              </Link>
            </div>
            <div className="pointer-events-none absolute -right-3 bottom-[-1px] hidden md:block">
              <ScaledScreen
                w={340}
                h={440}
                scale={0.62}
                className="rounded-[16px]"
              >
                <ShareCard />
              </ScaledScreen>
            </div>
          </article>
        </StaggerItem>

        {/* Recipients */}
        <StaggerItem>
          <article className="relative min-h-[320px] overflow-hidden rounded-[24px] border border-white/12 bg-[radial-gradient(120%_130%_at_82%_-10%,rgba(94,124,250,0.5),transparent_60%),radial-gradient(110%_120%_at_10%_110%,rgba(53,199,123,0.28),transparent_62%),linear-gradient(160deg,#141d22,#101018_70%)] p-[30px] shadow-[0_50px_110px_-60px_#000]">
            <div className="relative z-[1] flex max-w-[58%] flex-col items-start gap-3.5">
              <span className="text-vd-pos font-mono text-[10.5px] font-bold tracking-[0.12em] uppercase">
                For recipients
              </span>
              <h3 className="text-[25px] font-extrabold tracking-[-0.02em] text-white">
                Prove it, then unlock
              </h3>
              <p className="text-sm leading-relaxed text-white/80">
                Satisfy each condition — a signature, a secret, an NDA. The
                enclave checks privately and hands back the key. No account
                required.
              </p>
              <a
                href="#privacy"
                className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0a0b0db8] px-4 py-2.5 text-[13px] font-bold text-white backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                How unlocking works
                <ArrowRight className="size-3.5" />
              </a>
            </div>
            <div className="pointer-events-none absolute -right-3 bottom-[-1px] hidden md:block">
              <ScaledScreen
                w={320}
                h={440}
                scale={0.58}
                className="rounded-[16px]"
              >
                <UnlockCard />
              </ScaledScreen>
            </div>
          </article>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
