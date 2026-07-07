import { NextResponse } from "next/server";
import { z } from "zod";

import { getEnclaveEngine } from "@/lib/enclave/engine";
import { recordEvent } from "@/lib/repository/events-repo";
import { getVault } from "@/lib/repository/vault-repo";
import type { UnlockRequest } from "@/lib/enclave/types";

/**
 * Request key release from the enclave. The body carries the recipient's
 * ephemeral public key and their proofs (passphrase, etc.) ECIES-wrapped to the
 * enclave. The enclave evaluates policy in-boundary and either re-wraps the CEK
 * to the recipient + signs the grant, or returns a signed denial. No key
 * material is ever returned unless the policy passed.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const wrappedSchema = z.object({
  epk: z.record(z.string(), z.unknown()),
  iv: z.string(),
  ct: z.string(),
});

const unlockSchema = z.object({
  vaultId: z.string().min(1),
  recipientPublicJwk: z.record(z.string(), z.unknown()),
  wrappedProofs: wrappedSchema,
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid unlock payload", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const vault = await getVault(parsed.data.vaultId);
    if (!vault) {
      return NextResponse.json({ message: "Vault not found" }, { status: 404 });
    }
    if (vault.status === "revoked" || vault.status === "expired") {
      return NextResponse.json(
        { message: "This vault is no longer available" },
        { status: 410 },
      );
    }

    const result = await getEnclaveEngine().unlock(
      parsed.data as unknown as UnlockRequest,
    );
    await recordEvent({
      vaultId: parsed.data.vaultId,
      type: result.granted ? "unlocked" : "denied",
      wallet: result.provenAddress ?? null,
      measurement: result.attestation.claim.measurement,
      meta: {
        failed: result.results
          .filter((r) => !r.ok)
          .map((r) => r.kind),
      },
    }).catch(() => {});
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
