"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns true after the component has mounted on the client.
 * Implemented with useSyncExternalStore (server snapshot = false, client
 * snapshot = true) so it needs no effect and avoids hydration mismatches.
 * Handy for gating theme-dependent or window-dependent UI.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
