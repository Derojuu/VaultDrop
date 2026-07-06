import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { AccessRules } from "@/components/sections/access-rules";
import { Boundary } from "@/components/sections/boundary";
import { BuiltOn } from "@/components/sections/built-on";
import { FooterCta } from "@/components/sections/footer-cta";
import { GetStarted } from "@/components/sections/get-started";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { TrustModel } from "@/components/sections/trust-model";
import { UseCases } from "@/components/sections/use-cases";

export default function HomePage() {
  return (
    <>
      <SiteNav />

      <main className="flex-1 overflow-x-clip pb-8">
        <Hero />
        <BuiltOn />
        <HowItWorks />
        <AccessRules />
        <Boundary />
        <TrustModel />
        <UseCases />
        <GetStarted />
        <FooterCta />
      </main>

      <SiteFooter />
    </>
  );
}
