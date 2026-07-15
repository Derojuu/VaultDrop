import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { listRecipients } from "@/lib/repository/events-repo";

/** Distinct proven wallets the enclave has identified (wallet-gated unlocks). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const recipients = await listRecipients(user.id);
    return NextResponse.json({ recipients });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
