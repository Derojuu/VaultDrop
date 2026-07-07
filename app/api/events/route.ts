import { NextResponse } from "next/server";

import { listEvents } from "@/lib/repository/events-repo";

/** Recent audit events across all vaults, or one vault via ?vaultId=. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vaultId = searchParams.get("vaultId") ?? undefined;
    const events = await listEvents({ vaultId });
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
