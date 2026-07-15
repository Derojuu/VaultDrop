import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { deleteCiphertext } from "@/lib/repository/blob-repo";
import { recordEvent } from "@/lib/repository/events-repo";
import { revokeVault } from "@/lib/repository/vault-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const vault = await revokeVault(id, user.id);
    if (!vault) {
      return NextResponse.json({ message: "Vault not found" }, { status: 404 });
    }
    // Instant revoke: destroy the ciphertext so the file can never be recovered.
    await deleteCiphertext(id).catch(() => {});
    await recordEvent({ vaultId: id, type: "revoked" }).catch(() => {});
    return NextResponse.json({ vault });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
