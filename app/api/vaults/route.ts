import { NextResponse } from "next/server";
import { z } from "zod";

import { insertVault, listVaults } from "@/lib/repository/vault-repo";
import { CONDITION_KINDS } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const conditionSchema = z.object({
  id: z.string(),
  kind: z.enum(CONDITION_KINDS),
  label: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
  enclaveEvaluated: z.boolean(),
});

const createSchema = z.object({
  name: z.string().min(1).max(120),
  fileName: z.string().min(1),
  fileSize: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
  conditions: z.array(conditionSchema),
  ivB64: z.string().optional(),
  contentHash: z.string().optional(),
});

function vaultId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  const b64url = Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `vlt_${b64url}`;
}

export async function GET() {
  try {
    const vaults = await listVaults();
    return NextResponse.json({ vaults });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid vault payload", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const id = vaultId();
    const vault = await insertVault({
      id,
      ...parsed.data,
      network: "coston2",
      sealRef: `seal_0x${id.slice(4, 12)}`,
    });
    return NextResponse.json({ vault }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
