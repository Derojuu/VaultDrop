"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createVault,
  getVault,
  listVaults,
  revokeVault,
  type CreateVaultInput,
} from "@/services/vaults";

export const vaultKeys = {
  all: ["vaults"] as const,
  detail: (id: string) => ["vaults", id] as const,
};

export function useVaults() {
  return useQuery({ queryKey: vaultKeys.all, queryFn: listVaults });
}

export function useVault(id: string) {
  return useQuery({
    queryKey: vaultKeys.detail(id),
    queryFn: () => getVault(id),
    enabled: Boolean(id),
  });
}

export function useCreateVault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVaultInput) => createVault(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: vaultKeys.all }),
  });
}

export function useRevokeVault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeVault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: vaultKeys.all }),
  });
}
