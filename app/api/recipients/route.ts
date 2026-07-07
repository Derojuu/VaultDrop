import { NextResponse } from "next/server";

import { listRecipients } from "@/lib/repository/events-repo";

/** Distinct proven wallets the enclave has identified (wallet-gated unlocks). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recipients = await listRecipients();
    return NextResponse.json({ recipients });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
