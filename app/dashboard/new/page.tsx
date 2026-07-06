import { VaultBuilder } from "@/components/dashboard/builder/vault-builder";

export const metadata = { title: "New vault" };

export default function NewVaultPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-[760px]">
        <h1 className="text-vd-tx text-[24px] font-extrabold tracking-[-0.025em]">
          Create a vault
        </h1>
        <p className="text-vd-tx2 mt-1.5 text-sm">
          Encrypt a file, attach conditions, and seal the key into Flare
          Confidential Compute.
        </p>
      </div>
      <VaultBuilder />
    </div>
  );
}
