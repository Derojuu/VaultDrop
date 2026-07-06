import type { AccessCondition, Vault, VaultEvent } from "@/types";

/**
 * In-memory sample data for the hackathon build. Replace with real
 * storage + enclave calls once the backend lands (see services/vaults.ts).
 */

function cond(
  id: string,
  kind: AccessCondition["kind"],
  label: string,
  enclave = false,
): AccessCondition {
  return { id, kind, label, enclaveEvaluated: enclave };
}

export const MOCK_VAULTS: Vault[] = [
  {
    id: "vlt_9x7p4a",
    name: "Q3 Investor Deck",
    fileName: "q3-deck.pdf",
    fileSize: 4_404_019,
    mimeType: "application/pdf",
    status: "active",
    network: "coston2",
    createdAt: "2026-07-01T09:12:00.000Z",
    updatedAt: "2026-07-04T16:40:00.000Z",
    sealRef: "seal_0x3f…a91c",
    conditions: [
      cond("c1", "token", "Holds ACCESS token", true),
      cond("c2", "passphrase", "Secret passphrase", true),
      cond("c3", "expiry", "Expires in 30 days"),
    ],
  },
  {
    id: "vlt_k2m8qz",
    name: "Design Handoff",
    fileName: "brand-final.zip",
    fileSize: 28_991_233,
    mimeType: "application/zip",
    status: "active",
    network: "coston2",
    createdAt: "2026-07-03T11:02:00.000Z",
    updatedAt: "2026-07-04T10:15:00.000Z",
    sealRef: "seal_0x7b…44df",
    conditions: [
      cond("c1", "wallet", "Client wallet verified", true),
      cond("c2", "download-limit", "Max 2 downloads"),
    ],
  },
  {
    id: "vlt_t5r0wn",
    name: "Mutual NDA",
    fileName: "nda-2026.pdf",
    fileSize: 182_442,
    mimeType: "application/pdf",
    status: "sealed",
    network: "coston2",
    createdAt: "2026-07-04T08:20:00.000Z",
    updatedAt: "2026-07-04T08:20:00.000Z",
    sealRef: "seal_0x1a…9e02",
    conditions: [
      cond("c1", "nda", "Accept NDA", true),
      cond("c2", "one-time", "One-time access"),
    ],
  },
  {
    id: "vlt_b3n1ce",
    name: "Contractor Agreement",
    fileName: "agreement.pdf",
    fileSize: 96_010,
    mimeType: "application/pdf",
    status: "expired",
    network: "coston2",
    createdAt: "2026-06-20T14:00:00.000Z",
    updatedAt: "2026-06-22T14:00:00.000Z",
    sealRef: "seal_0x9c…21b7",
    conditions: [cond("c1", "expiry", "Expired 48h window")],
  },
  {
    id: "vlt_r8x2ld",
    name: "API Credentials",
    fileName: "keys.env",
    fileSize: 1_204,
    mimeType: "text/plain",
    status: "revoked",
    network: "coston2",
    createdAt: "2026-06-28T17:30:00.000Z",
    updatedAt: "2026-07-02T09:00:00.000Z",
    conditions: [
      cond("c1", "wallet", "Team wallet only", true),
      cond("c2", "one-time", "One-time access"),
    ],
  },
];

export const MOCK_EVENTS: VaultEvent[] = [
  {
    id: "e1",
    vaultId: "vlt_9x7p4a",
    type: "unlocked",
    at: "2026-07-04T16:40:00.000Z",
  },
  {
    id: "e2",
    vaultId: "vlt_9x7p4a",
    type: "viewed",
    at: "2026-07-04T16:38:00.000Z",
  },
  {
    id: "e3",
    vaultId: "vlt_k2m8qz",
    type: "downloaded",
    at: "2026-07-04T10:15:00.000Z",
  },
  {
    id: "e4",
    vaultId: "vlt_t5r0wn",
    type: "sealed",
    at: "2026-07-04T08:20:00.000Z",
  },
  {
    id: "e5",
    vaultId: "vlt_9x7p4a",
    type: "denied",
    at: "2026-07-03T22:11:00.000Z",
  },
  {
    id: "e6",
    vaultId: "vlt_b3n1ce",
    type: "expired",
    at: "2026-06-22T14:00:00.000Z",
  },
  {
    id: "e7",
    vaultId: "vlt_r8x2ld",
    type: "revoked",
    at: "2026-07-02T09:00:00.000Z",
  },
];
