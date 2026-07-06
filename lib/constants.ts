/**
 * Global, environment-agnostic constants for VaultDrop.
 * Anything secret or environment-specific lives in `lib/env.ts` instead.
 */

export const APP_NAME = "VaultDrop";
export const APP_TAGLINE = "Every file has rules.";
export const APP_DESCRIPTION =
  "Files that enforce their own rules. VaultDrop seals a file's decryption key " +
  "inside Flare Confidential Compute and releases it only when the recipient " +
  "provably satisfies your access conditions.";

/** Supported Flare deployment targets. */
export const FLARE_NETWORKS = {
  coston2: {
    id: 114,
    label: "Coston2",
    kind: "testnet",
    rpc: "https://coston2-api.flare.network/ext/C/rpc",
    explorer: "https://coston2-explorer.flare.network",
  },
  songbird: {
    id: 19,
    label: "Songbird",
    kind: "canary",
    rpc: "https://songbird-api.flare.network/ext/C/rpc",
    explorer: "https://songbird-explorer.flare.network",
  },
  flare: {
    id: 14,
    label: "Flare",
    kind: "mainnet",
    rpc: "https://flare-api.flare.network/ext/C/rpc",
    explorer: "https://flare-explorer.flare.network",
  },
} as const;

export type FlareNetworkKey = keyof typeof FLARE_NETWORKS;

/** Access-condition kinds a vault policy can require. */
export const CONDITION_KINDS = [
  "passphrase",
  "wallet",
  "token",
  "nft",
  "expiry",
  "download-limit",
  "one-time",
  "nda",
] as const;

export type ConditionKind = (typeof CONDITION_KINDS)[number];

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  vaults: "/vaults",
  newVault: "/vaults/new",
} as const;
