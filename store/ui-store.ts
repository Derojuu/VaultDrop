import { create } from "zustand";

/**
 * Lightweight global UI state (client-only). Domain/server state should live in
 * TanStack Query, not here — this is for ephemeral interface concerns.
 */
interface UiState {
  /** Desktop sidebar collapsed to icon-rail. */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  /** Mobile sidebar drawer open state. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;

  /** The vault currently open in a side panel, if any. */
  activeVaultId: string | null;
  setActiveVaultId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),

  activeVaultId: null,
  setActiveVaultId: (id) => set({ activeVaultId: id }),
}));
