import type { ConditionKind, FlareNetworkKey } from "@/lib/constants";

/** A single access condition attached to a vault policy. */
export interface AccessCondition {
  id: string;
  kind: ConditionKind;
  label: string;
  /** Condition-specific config, shape depends on `kind`. */
  config?: Record<string, unknown>;
  /** True when this condition is evaluated inside the Flare enclave. */
  enclaveEvaluated: boolean;
}

export type VaultStatus = "draft" | "sealed" | "active" | "expired" | "revoked";

/** A sealed file + its programmable access policy. */
export interface Vault {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: VaultStatus;
  conditions: AccessCondition[];
  network: FlareNetworkKey;
  createdAt: string;
  updatedAt: string;
  /** Populated once the key is sealed into confidential compute. */
  sealRef?: string;
  /** Base64 AES-GCM IV for the encrypted blob (real crypto, Step 2+). */
  ivB64?: string;
  /** SHA-256 (hex) of the plaintext, for recipient-side integrity check. */
  contentHash?: string;
}

export type VaultEventType =
  | "uploaded"
  | "encrypted"
  | "sealed"
  | "shared"
  | "viewed"
  | "unlocked"
  | "downloaded"
  | "denied"
  | "expired"
  | "revoked";

export interface VaultEvent {
  id: string;
  vaultId: string;
  type: VaultEventType;
  at: string;
  meta?: Record<string, unknown>;
}

/** Generic paginated API envelope. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
