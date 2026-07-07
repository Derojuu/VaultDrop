import { NextResponse } from "next/server";
import { z } from "zod";

import { getEnclaveEngine } from "@/lib/enclave/engine";
import { recordEvent } from "@/lib/repository/events-repo";
import { getVault } from "@/lib/repository/vault-repo";
import type { SealRequest } from "@/lib/enclave/types";

/**
 * Seal a vault's Content Encryption Key into the enclave. The body carries the
 * CEK + policy secrets ECIES-wrapped to the enclave's public key, so this route
 * (and everything it touches) only ever sees ciphertext — the enclave alone can
 * open the envelope. This is the "secret-in" step of the FCE model.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const wrappedSchema = z.object({
  epk: z.record(z.string(), z.unknown()),
  iv: z.string(),
  ct: z.string(),
});

const sealSchema = z.object({
  vaultId: z.string().min(1),
  wrapped: wrappedSchema,
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid seal payload", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const vault = await getVault(parsed.data.vaultId);
    if (!vault) {
      return NextResponse.json({ message: "Vault not found" }, { status: 404 });
    }

    const result = await getEnclaveEngine().seal(
      parsed.data as unknown as SealRequest,
    );
    await recordEvent({
      vaultId: parsed.data.vaultId,
      type: "sealed",
      measurement: result.measurement,
    }).catch(() => {});
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
