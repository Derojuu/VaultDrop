import type { AccessCondition, Vault } from "@/types";

/**
 * Vault metadata data-access — talks to the app's own /api/vaults route
 * handlers (which persist to Postgres). Relative URLs so it works on
 * localhost, ngrok, or a deployed origin without config.
 *
 * The content key is never sent here — only metadata. That's the point.
 */

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ?? res.statusText;
    throw new Error(message);
  }
  return payload as T;
}

export async function listVaults(): Promise<Vault[]> {
  const { vaults } = await jsonFetch<{ vaults: Vault[] }>("/api/vaults");
  return vaults;
}

export async function getVault(id: string): Promise<Vault | null> {
  try {
    const { vault } = await jsonFetch<{ vault: Vault }>(
      `/api/vaults/${encodeURIComponent(id)}`,
    );
    return vault;
  } catch {
    return null;
  }
}

export interface CreateVaultInput {
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  conditions: AccessCondition[];
  ivB64?: string;
  contentHash?: string;
}

export async function createVault(input: CreateVaultInput): Promise<Vault> {
  const { vault } = await jsonFetch<{ vault: Vault }>("/api/vaults", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return vault;
}

export async function revokeVault(id: string): Promise<Vault | null> {
  try {
    const { vault } = await jsonFetch<{ vault: Vault }>(
      `/api/vaults/${encodeURIComponent(id)}/revoke`,
      { method: "POST" },
    );
    return vault;
  } catch {
    return null;
  }
}
