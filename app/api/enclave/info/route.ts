import { NextResponse } from "next/server";

import { getEnclaveEngine } from "@/lib/enclave/engine";

/**
 * Enclave identity endpoint (mirrors the FCE proxy `/info`). Returns only the
 * enclave's PUBLIC keys + code measurement — the sender wraps the CEK to
 * `encryptionPublicJwk`, and the recipient verifies attestations against
 * `signingPublicJwk`. No private material ever crosses this boundary.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const info = await getEnclaveEngine().info();
    return NextResponse.json(info, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
