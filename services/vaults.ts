import { MOCK_VAULTS } from "@/lib/mock-data";
import type { AccessCondition, Vault } from "@/types";

/**
 * Mock vault data-access layer. In-memory and client-side for the hackathon
 * build — swap these for real API/enclave calls without touching the hooks
 * that consume them.
 */

// Session-lived store, seeded from the mock fixtures.
let store: Vault[] = [...MOCK_VAULTS];

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function listVaults(): Promise<Vault[]> {
  return delay([...store]);
}

export async function getVault(id: string): Promise<Vault | null> {
  return delay(store.find((v) => v.id === id) ?? null);
}

export interface CreateVaultInput {
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  conditions: AccessCondition[];
  /** Real AES-GCM IV (base64) for the encrypted blob. */
  ivB64?: string;
  /** SHA-256 (hex) of the plaintext. */
  contentHash?: string;
}

/**
 * Records vault metadata. The file is already encrypted client-side and the
 * ciphertext stored separately (blob-store); the content key never reaches
 * this layer — that's the point. Enclave sealing lands in Step 4.
 */
export async function createVault(input: CreateVaultInput): Promise<Vault> {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 8);
  const vault: Vault = {
    id: `vlt_${rand}`,
    name: input.name,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    status: "sealed",
    network: "coston2",
    createdAt: now,
    updatedAt: now,
    sealRef: `seal_0x${rand}`,
    conditions: input.conditions,
    ivB64: input.ivB64,
    contentHash: input.contentHash,
  };
  store = [vault, ...store];
  return delay(vault, 600);
}

export async function revokeVault(id: string): Promise<Vault | null> {
  store = store.map((v) =>
    v.id === id
      ? { ...v, status: "revoked", updatedAt: new Date().toISOString() }
      : v,
  );
  return delay(store.find((v) => v.id === id) ?? null);
}
