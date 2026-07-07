import { NextResponse } from "next/server";

import { getVault } from "@/lib/repository/vault-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const vault = await getVault(id);
    if (!vault) {
      return NextResponse.json({ message: "Vault not found" }, { status: 404 });
    }
    return NextResponse.json({ vault });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
