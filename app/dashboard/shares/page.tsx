import { Link2 } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "Shares" };

export default function SharesPage() {
  return (
    <ComingSoon
      icon={Link2}
      title="Share links"
      description="Manage every active share link — expiry, download counts, and instant revoke, all in one place."
    />
  );
}
