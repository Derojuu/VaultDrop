"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronsLeft,
  Loader2,
  LogOut,
  PanelLeft,
  Plus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useVaults } from "@/hooks/use-vaults";
import {
  DASHBOARD_NAV,
  DASHBOARD_NAV_SECONDARY,
  type NavItem,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { useWalletStore } from "@/store/wallet-store";
import type { VaultStatus } from "@/types";
import { truncateMiddle } from "@/utils/format";

const STATUS_TONE: Record<VaultStatus, string> = {
  active: "pos",
  sealed: "accent",
  draft: "warn",
  expired: "warn",
  revoked: "dng",
};

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function NavRow({
  item,
  active,
  collapsed,
  scope,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  scope: "desktop" | "mobile";
}) {
  const Icon: LucideIcon = item.icon;
  const spring = { type: "spring" as const, stiffness: 420, damping: 36 };
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13.5px] font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "text-vd-tx font-semibold"
          : "text-vd-tx2 hover:text-vd-tx hover:bg-white/[0.05]",
      )}
    >
      {active && (
        <>
          <motion.span
            layoutId={`sb-pill-${scope}`}
            transition={spring}
            className="absolute inset-0 rounded-[11px] bg-[linear-gradient(90deg,rgba(94,124,250,0.18),rgba(94,124,250,0.03))]"
          />
          <motion.span
            layoutId={`sb-bar-${scope}`}
            transition={spring}
            className="bg-vd-accent absolute top-2.5 bottom-2.5 left-0 w-[2.5px] rounded-full"
          />
        </>
      )}
      <Icon
        className={cn(
          "relative z-[1] size-[18px]",
          active && "text-vd-accent2",
        )}
      />
      {!collapsed && <span className="relative z-[1]">{item.label}</span>}
    </Link>
  );
}

function SidebarBody({ scope }: { scope: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const setMobile = useUiStore((s) => s.setMobileNavOpen);

  const { data: vaults } = useVaults();
  const recent = (vaults ?? []).slice(0, 5);

  const address = useWalletStore((s) => s.address);
  const connecting = useWalletStore((s) => s.connecting);
  const connect = useWalletStore((s) => s.connect);
  const disconnect = useWalletStore((s) => s.disconnect);

  async function onConnect() {
    try {
      await connect();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't connect a wallet.");
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      {/* Brand + collapse */}
      <div
        className={cn(
          "flex items-center gap-2 px-1.5 pt-1",
          collapsed && "justify-center px-0",
        )}
      >
        <Link
          href="/"
          aria-label="VaultDrop home"
          className="flex items-center gap-2"
        >
          <LogoMark />
          {!collapsed && (
            <span className="text-vd-tx text-[15px] font-extrabold tracking-[-0.02em]">
              VaultDrop
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={toggle}
            aria-label="Collapse sidebar"
            className="text-vd-tx3 hover:text-vd-tx ml-auto hidden size-8 place-items-center rounded-[9px] transition-colors hover:bg-white/[0.05] md:grid"
          >
            <ChevronsLeft className="size-4" />
          </button>
        )}
      </div>

      {/* New vault */}
      <Button
        asChild
        className={cn("w-full", collapsed && "px-0")}
        size={collapsed ? "icon" : "default"}
      >
        <Link
          href="/dashboard/new"
          onClick={() => setMobile(false)}
          title={collapsed ? "New vault" : undefined}
        >
          <Plus />
          {!collapsed && "New vault"}
        </Link>
      </Button>

      {collapsed && (
        <button
          onClick={toggle}
          aria-label="Expand sidebar"
          className="text-vd-tx3 hover:text-vd-tx mx-auto hidden size-8 place-items-center rounded-[9px] transition-colors hover:bg-white/[0.05] md:grid"
        >
          <PanelLeft className="size-4" />
        </button>
      )}

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5">
        {DASHBOARD_NAV.map((item) => (
          <div key={item.href} onClick={() => setMobile(false)}>
            <NavRow
              item={item}
              active={isActive(pathname, item)}
              collapsed={collapsed}
              scope={scope}
            />
          </div>
        ))}
      </nav>

      {/* Recent vaults (history rail) */}
      {!collapsed && recent.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col">
          <span className="mono-label px-2 pb-2">Recent vaults</span>
          <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
            {recent.map((v) => (
              <Link
                key={v.id}
                href={`/dashboard/vaults/${v.id}`}
                onClick={() => setMobile(false)}
                className="text-vd-tx2 hover:text-vd-tx flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] transition-colors hover:bg-white/[0.05]"
              >
                <span
                  className="status-dot shrink-0"
                  data-tone={STATUS_TONE[v.status]}
                />
                <span className="truncate">{v.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!collapsed && <div className="flex-1" />}

      {/* Secondary nav + account */}
      <div className="border-vd-bd mt-auto flex flex-col gap-1 border-t pt-3">
        {DASHBOARD_NAV_SECONDARY.map((item) => (
          <NavRow
            key={item.href}
            item={item}
            active={isActive(pathname, item)}
            collapsed={collapsed}
            scope={scope}
          />
        ))}

        {collapsed ? (
          <button
            onClick={address ? disconnect : onConnect}
            disabled={connecting}
            title={
              address
                ? `${truncateMiddle(address)} · click to disconnect`
                : "Connect wallet"
            }
            className="mx-auto grid size-8 place-items-center rounded-full bg-[linear-gradient(135deg,#8a9bff,#5e7cfa)] disabled:opacity-60"
          >
            {connecting ? (
              <Loader2 className="size-3.5 animate-spin text-white" />
            ) : address ? null : (
              <Wallet className="size-3.5 text-white" />
            )}
          </button>
        ) : address ? (
          <div className="border-vd-bd bg-vd-card mt-1 flex items-center gap-2.5 rounded-[11px] border p-2.5">
            <span className="size-7 shrink-0 rounded-full bg-[linear-gradient(135deg,#8a9bff,#5e7cfa)]" />
            <div className="min-w-0 leading-tight">
              <div className="text-vd-tx text-[12.5px] font-semibold">
                Wallet
              </div>
              <div className="text-vd-tx3 truncate font-mono text-[10px]">
                {truncateMiddle(address)}
              </div>
            </div>
            <button
              onClick={disconnect}
              title="Disconnect"
              className="text-vd-tx3 hover:text-vd-dng ml-auto grid size-7 shrink-0 place-items-center rounded-[8px] transition-colors hover:bg-white/[0.05]"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="border-vd-bd bg-vd-card mt-1 flex items-center gap-2.5 rounded-[11px] border p-2.5 text-left transition-colors hover:bg-white/[0.05] disabled:opacity-60"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#8a9bff,#5e7cfa)]">
              {connecting ? (
                <Loader2 className="size-3.5 animate-spin text-white" />
              ) : (
                <Wallet className="size-3.5 text-white" />
              )}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="text-vd-tx text-[12.5px] font-semibold">
                {connecting ? "Connecting…" : "Connect wallet"}
              </div>
              <div className="text-vd-tx3 truncate text-[10px]">
                Prove address ownership
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobile = useUiStore((s) => s.setMobileNavOpen);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "border-vd-bd bg-vd-side hidden h-dvh shrink-0 overflow-hidden border-r transition-[width] duration-200 md:block",
          collapsed ? "w-[72px]" : "w-[264px]",
        )}
      >
        <SidebarBody scope="desktop" />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobile(false)}
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "border-vd-bd bg-vd-side absolute inset-y-0 left-0 w-[280px] border-r shadow-2xl transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarBody scope="mobile" />
        </div>
      </div>
    </>
  );
}
