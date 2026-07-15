import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/**
 * Centered closing CTA with the amber testnet flag — mirrors the reference
 * "footer-cta" block (mark, headline, actions, testnet warning).
 */
export function FooterCta() {
  return (
    <section className="mx-auto mt-24 flex w-[min(1180px,calc(100%-2.5rem))] flex-col items-center px-6 pb-6 text-center">
      <LogoMark className="size-12" />

      <h2 className="text-vd-tx mt-5.5 max-w-[560px] text-[clamp(32px,4.6vw,52px)] leading-[1.03] font-extrabold tracking-[-0.028em]">
        Your files. Out of everyone else&apos;s hands.
      </h2>
      <p className="text-vd-tx2 mt-4 max-w-[470px] text-base leading-relaxed">
        Self-custody of the key, real confidential compute, on Flare. Seal your
        first vault and share it with rules that enforce themselves.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="sheen relative overflow-hidden">
          <Link href="/login?next=/dashboard/new">
            Create a vault
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <a href="#how">See the rules</a>
        </Button>
      </div>

      <span className="testnet-flag mt-7.5">
        Testnet · early build — don&apos;t seal production secrets yet
      </span>
    </section>
  );
}
