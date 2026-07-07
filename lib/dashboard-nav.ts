import {
  Activity,
  Cpu,
  LayoutGrid,
  Link2,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match nested routes (e.g. /dashboard/vaults/123). */
  exact?: boolean;
}

/** Primary dashboard navigation, shared by the sidebar and mobile drawer. */
export const DASHBOARD_NAV: NavItem[] = [
  { label: "Vaults", href: "/dashboard", icon: LayoutGrid, exact: true },
  { label: "Activity", href: "/dashboard/activity", icon: Activity },
  { label: "Shares", href: "/dashboard/shares", icon: Link2 },
  { label: "Recipients", href: "/dashboard/recipients", icon: Users },
];

export const DASHBOARD_NAV_SECONDARY: NavItem[] = [
  { label: "Enclave", href: "/dashboard/enclave", icon: Cpu },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
