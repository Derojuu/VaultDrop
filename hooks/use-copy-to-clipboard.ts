"use client";

import { useCallback, useRef, useState } from "react";

interface UseCopyToClipboard {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

/**
 * Copy text to the clipboard and expose a transient `copied` flag
 * (auto-resets after `timeout` ms). Used by share-link / address UI.
 */
export function useCopyToClipboard(timeout = 1600): UseCopyToClipboard {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeout],
  );

  return { copied, copy };
}
