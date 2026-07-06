import { Badge } from "@/components/ui/badge";
import type { VaultStatus } from "@/types";

const MAP: Record<
  VaultStatus,
  {
    label: string;
    variant: "success" | "accent" | "warning" | "danger" | "outline";
  }
> = {
  active: { label: "Active", variant: "success" },
  sealed: { label: "Sealed", variant: "accent" },
  draft: { label: "Draft", variant: "outline" },
  expired: { label: "Expired", variant: "warning" },
  revoked: { label: "Revoked", variant: "danger" },
};

export function VaultStatusBadge({ status }: { status: VaultStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
