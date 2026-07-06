import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#trust", label: "Trust model" },
  { href: "#use-cases", label: "Use cases" },
];

/**
 * Floating glassmorphic pill nav — the reference's signature header.
 */
export function SiteNav() {
  return (
    <header className="glass-pill sticky top-3.5 z-50 mx-auto mt-4 flex w-[min(920px,calc(100%-2rem))] items-center gap-5 py-2.5 pr-2.5 pl-4">
      <Link href="/" aria-label="VaultDrop home">
        <Logo />
      </Link>

      <nav
        aria-label="Primary"
        className="text-vd-tx2 ml-auto hidden items-center gap-5 text-[13.5px] md:flex"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hover:text-vd-tx transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <Button asChild size="sm" className="ml-auto md:ml-0">
        <Link href="/dashboard">Open app</Link>
      </Button>
    </header>
  );
}
