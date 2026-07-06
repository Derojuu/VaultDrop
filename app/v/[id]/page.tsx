import { VaultUnlock } from "@/components/unlock/vault-unlock";

export const metadata = { title: "Unlock vault" };

export default async function UnlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VaultUnlock id={id} />;
}
