import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  summary,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <header className="border-vd-bd border-b px-5 pt-16 pb-12 sm:px-8 sm:pt-20">
          <div className="mx-auto w-full max-w-[980px]">
            <Link
              href="/"
              className="text-vd-tx3 hover:text-vd-tx inline-flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to VaultDrop
            </Link>

            <div className="mt-8 flex items-center gap-2">
              <FileText className="text-vd-accent2 size-4" />
              <span className="mono-label text-vd-accent2">{eyebrow}</span>
            </div>
            <h1 className="text-vd-tx mt-4 text-[38px] leading-[1.04] font-extrabold sm:text-[50px]">
              {title}
            </h1>
            <p className="text-vd-tx2 mt-5 max-w-[720px] text-[15px] leading-7 sm:text-base">
              {summary}
            </p>
            <p className="text-vd-tx3 mt-5 font-mono text-[11px] uppercase">
              Last updated: July 15, 2026
            </p>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-[980px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:py-16">
          <aside className="hidden lg:block">
            <nav
              aria-label={`${title} sections`}
              className="sticky top-24 flex flex-col gap-1"
            >
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-vd-tx3 hover:text-vd-tx rounded-[6px] px-2 py-1.5 text-xs transition-colors hover:bg-white/[0.04]"
                >
                  {index + 1}. {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="min-w-0">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="border-vd-bd scroll-mt-24 border-b py-8 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-vd-accent2 font-mono text-[11px]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-vd-tx text-xl font-extrabold">
                    {section.title}
                  </h2>
                </div>
                <div className="text-vd-tx2 mt-4 space-y-4 text-sm leading-7 [&_a]:text-vd-accent2 [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:pl-1 [&_strong]:text-vd-tx [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
                  {section.content}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
