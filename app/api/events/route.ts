import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { listEvents } from "@/lib/repository/events-repo";

/** Recent audit events across all vaults, or one vault via ?vaultId=. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const vaultId = searchParams.get("vaultId") ?? undefined;
    const events = await listEvents({ ownerId: user.id, vaultId });
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
