import type { Metadata } from "next";

import { EnclaveTrustContent } from "@/components/attestation/enclave-trust";

export const metadata: Metadata = { title: "Enclave" };

export default function DashboardEnclavePage() {
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <EnclaveTrustContent />
    </div>
  );
}
