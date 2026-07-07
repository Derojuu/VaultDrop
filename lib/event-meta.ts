import {
  Ban,
  CheckCircle2,
  Download,
  Eye,
  FileLock2,
  KeyRound,
  Link2,
  ShieldX,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { VaultEventType } from "@/types";

export interface EventMeta {
  label: string;
  icon: LucideIcon;
  /** Text-color class for the icon. */
  tone: string;
}

/** Display metadata for every audit-event type. Single source of truth. */
export const EVENT_META: Record<VaultEventType, EventMeta> = {
  uploaded: { label: "Ciphertext uploaded", icon: FileLock2, tone: "text-vd-tx2" },
  encrypted: { label: "Encrypted", icon: KeyRound, tone: "text-vd-tx2" },
  sealed: { label: "Key sealed into enclave", icon: KeyRound, tone: "text-vd-accent2" },
  shared: { label: "Share link created", icon: Link2, tone: "text-vd-tx2" },
  viewed: { label: "Viewed", icon: Eye, tone: "text-vd-tx2" },
  unlocked: { label: "Unlocked by enclave", icon: CheckCircle2, tone: "text-vd-pos" },
  downloaded: { label: "Downloaded", icon: Download, tone: "text-vd-pos" },
  denied: { label: "Access denied", icon: ShieldX, tone: "text-vd-warn" },
  expired: { label: "Expired", icon: XCircle, tone: "text-vd-warn" },
  revoked: { label: "Revoked", icon: Ban, tone: "text-vd-dng" },
};
