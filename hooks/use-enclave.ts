"use client";

import { useQuery } from "@tanstack/react-query";

import { getEnclaveInfo } from "@/services/enclave";

/** The enclave's public identity (pubkeys + code measurement + mode). */
export function useEnclaveInfo() {
  return useQuery({
    queryKey: ["enclave-info"],
    queryFn: getEnclaveInfo,
    staleTime: 5 * 60 * 1000,
  });
}
