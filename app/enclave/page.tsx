import type { Metadata } from "next";

import { EnclaveTrust } from "@/components/attestation/enclave-trust";

export const metadata: Metadata = {
  title: "The enclave · VaultDrop",
  description:
    "How VaultDrop seals file keys in confidential compute and releases them only on a passing, attested policy check. Verify any receipt against the enclave's key.",
};

export default function EnclavePage() {
  return <EnclaveTrust />;
}
