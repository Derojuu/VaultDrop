import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { getCiphertext, putCiphertext } from "@/lib/repository/blob-repo";
import { recordEvent } from "@/lib/repository/events-repo";
import { getOwnedVault, getVault } from "@/lib/repository/vault-repo";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Upload the encrypted blob for a vault (ciphertext only — never the key). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const vault = await getOwnedVault(id, user.id);
    if (!vault) {
      return NextResponse.json({ message: "Vault not found" }, { status: 404 });
    }

    const buffer = await request.arrayBuffer();
    if (buffer.byteLength === 0) {
      return NextResponse.json({ message: "Empty body" }, { status: 400 });
    }
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { message: "Ciphertext too large" },
        { status: 413 },
      );
    }

    await putCiphertext(
      id,
      new Uint8Array(buffer),
      vault.mimeType || "application/octet-stream",
    );
    await recordEvent({
      vaultId: id,
      type: "uploaded",
      meta: { bytes: buffer.byteLength },
    }).catch(() => {});
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}

/** Download the encrypted blob. Refused for revoked/expired vaults. */
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
    if (vault.status === "revoked" || vault.status === "expired") {
      return NextResponse.json(
        { message: "This vault is no longer available" },
        { status: 410 },
      );
    }

    const blob = await getCiphertext(id);
    if (!blob) {
      return NextResponse.json(
        { message: "No ciphertext stored yet" },
        { status: 404 },
      );
    }

    return new Response(new Uint8Array(blob.ciphertext), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
