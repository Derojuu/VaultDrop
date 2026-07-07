"use client";

import { useQuery } from "@tanstack/react-query";

import { listEvents, listRecipients } from "@/services/events";

export const eventKeys = {
  all: ["events"] as const,
  vault: (id: string) => ["events", id] as const,
  recipients: ["recipients"] as const,
};

/** Audit events across all vaults, or one vault when `vaultId` is passed. */
export function useEvents(vaultId?: string) {
  return useQuery({
    queryKey: vaultId ? eventKeys.vault(vaultId) : eventKeys.all,
    queryFn: () => listEvents(vaultId),
  });
}

/** Proven wallets the enclave has identified. */
export function useRecipients() {
  return useQuery({
    queryKey: eventKeys.recipients,
    queryFn: listRecipients,
  });
}
