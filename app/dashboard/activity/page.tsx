import { Activity } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "Activity" };

export default function ActivityPage() {
  return (
    <ComingSoon
      icon={Activity}
      title="Activity feed"
      description="A unified timeline of every unlock, download, denied attempt, and revoke across all your vaults."
    />
  );
}
