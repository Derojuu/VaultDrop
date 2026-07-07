"use client";

import { create } from "zustand";

import { connectWallet } from "@/lib/chain/wallet";

/**
 * The address the user has connected in this session, shared across the UI
 * (sidebar account chip, settings). VaultDrop has no accounts — this is only
 * the wallet the browser has authorized, used to prove address ownership when
 * unlocking gated vaults. Nothing is persisted; a refresh clears it.
 */
interface WalletState {
  address: string | null;
  connecting: boolean;
  /** Prompt the injected wallet; throws on failure so callers can toast. */
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  connecting: false,
  connect: async () => {
    set({ connecting: true });
    try {
      const address = await connectWallet();
      set({ address, connecting: false });
    } catch (e) {
      set({ connecting: false });
      throw e;
    }
  },
  disconnect: () => set({ address: null }),
}));
