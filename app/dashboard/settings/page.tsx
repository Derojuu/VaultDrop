import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Settings"
      description="Connect a wallet, choose your Flare network, and manage encryption defaults for new vaults."
    />
  );
}
