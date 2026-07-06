import {
  Clock,
  Coins,
  Download,
  FileSignature,
  Fingerprint,
  Hexagon,
  Timer,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { ConditionKind } from "@/lib/constants";

export interface ConditionMeta {
  kind: ConditionKind;
  label: string;
  hint: string;
  icon: LucideIcon;
  /** True when evaluated privately inside Flare Confidential Compute. */
  enclave: boolean;
}

/**
 * Metadata for every access-condition kind — the single source of truth for
 * icons, labels, and which conditions are load-bearing on the enclave.
 */
export const CONDITION_META: Record<ConditionKind, ConditionMeta> = {
  wallet: {
    kind: "wallet",
    label: "Wallet verification",
    hint: "Recipient signs with an allowed wallet.",
    icon: Wallet,
    enclave: true,
  },
  token: {
    kind: "token",
    label: "Token ownership",
    hint: "Requires an ERC-20 balance, checked in-enclave.",
    icon: Coins,
    enclave: true,
  },
  nft: {
    kind: "nft",
    label: "NFT ownership",
    hint: "Requires holding an NFT from a collection.",
    icon: Hexagon,
    enclave: true,
  },
  passphrase: {
    kind: "passphrase",
    label: "Secret passphrase",
    hint: "Verified inside the enclave — the server never sees it.",
    icon: Fingerprint,
    enclave: true,
  },
  nda: {
    kind: "nda",
    label: "NDA acceptance",
    hint: "Recorded before the key is released.",
    icon: FileSignature,
    enclave: true,
  },
  expiry: {
    kind: "expiry",
    label: "Access expiry",
    hint: "Auto-locks after a set time window.",
    icon: Clock,
    enclave: false,
  },
  "download-limit": {
    kind: "download-limit",
    label: "Download limit",
    hint: "Caps the number of successful downloads.",
    icon: Download,
    enclave: false,
  },
  "one-time": {
    kind: "one-time",
    label: "One-time access",
    hint: "Self-destructs after a single unlock.",
    icon: Timer,
    enclave: false,
  },
};

export const CONDITION_LIST = Object.values(CONDITION_META);
