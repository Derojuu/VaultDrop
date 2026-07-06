import { Users } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "Recipients" };

export default function RecipientsPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Recipients"
      description="See who has unlocked your vaults, manage allowlists, and reuse recipient groups across vaults."
    />
  );
}
