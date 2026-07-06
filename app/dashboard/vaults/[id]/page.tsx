import { VaultDetail } from "@/components/dashboard/vault-detail";

export const metadata = { title: "Vault" };

export default async function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VaultDetail id={id} />;
}
