"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { DASHBOARD_NAV, DASHBOARD_NAV_SECONDARY } from "@/lib/dashboard-nav";
import { useUiStore } from "@/store/ui-store";

function useTitle(pathname: string): string {
  if (pathname === "/dashboard/new") return "New vault";
  if (pathname.startsWith("/dashboard/vaults/")) return "Vault";
  const match = [...DASHBOARD_NAV, ...DASHBOARD_NAV_SECONDARY].find((i) =>
    i.exact ? pathname === i.href : pathname.startsWith(i.href),
  );
  return match?.label ?? "Dashboard";
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const title = useTitle(pathname);
  const toggleMobile = useUiStore((s) => s.toggleMobileNav);

  return (
    <header className="border-vd-bd bg-vd-bg/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={toggleMobile}
        aria-label="Open navigation"
        className="text-vd-tx2 hover:text-vd-tx grid size-9 place-items-center rounded-[10px] transition-colors hover:bg-white/[0.05] md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="text-vd-tx text-[15px] font-extrabold tracking-[-0.02em]">
        {title}
      </h1>

      {/* Search (decorative for now) */}
      <label className="border-vd-bd bg-vd-card2 text-vd-tx3 ml-auto hidden items-center gap-2 rounded-[10px] border px-3 py-2 sm:flex">
        <Search className="size-4" />
        <input
          type="search"
          placeholder="Search vaults…"
          className="text-vd-tx placeholder:text-vd-tx3 w-40 bg-transparent text-[13px] outline-none"
        />
      </label>

      <StatusPill tone="pos" className="ml-auto sm:ml-0">
        Coston2
      </StatusPill>

      <Button asChild size="sm" className="hidden sm:inline-flex">
        <Link href="/dashboard/new">
          <Plus />
          New vault
        </Link>
      </Button>
    </header>
  );
}
