"use client";

import { useSyncExternalStore } from "react";

import { hasInjectedWallet } from "@/lib/chain/wallet";

/** No injected-wallet event to track — the snapshot is read once per render. */
const subscribe = () => () => {};

/**
 * Client-only wallet-presence check.
 *
 * Returns `null` during SSR/hydration (unknown), then `true`/`false` on the
 * client. Callers should treat `null` like "available" so the connect affordance
 * renders optimistically and only users who genuinely have no wallet ever see
 * the fallback. Backed by `useSyncExternalStore` so there's no hydration flip
 * and no setState-in-effect.
 */
export function useWalletAvailable(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => hasInjectedWallet(),
    () => null,
  );
}
