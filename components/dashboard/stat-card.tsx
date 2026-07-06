import type { LucideIcon } from "lucide-react";

import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "accent",
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "accent" | "pos" | "warn" | "dng";
  className?: string;
}) {
  const toneText = {
    accent: "text-vd-accent2",
    pos: "text-vd-pos",
    warn: "text-vd-warn",
    dng: "text-vd-dng",
  }[tone];

  return (
    <div
      className={cn(
        "surface-card flex items-center gap-4 p-4 sm:p-5",
        className,
      )}
    >
      <span
        className={cn(
          "border-vd-bd grid size-11 shrink-0 place-items-center rounded-[12px] border bg-white/[0.03]",
          toneText,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="text-vd-tx font-mono text-[26px] leading-none font-extrabold tracking-[-0.02em]">
          {typeof value === "number" ? <CountUp to={value} /> : value}
        </div>
        <div className="mono-label mt-1.5">{label}</div>
      </div>
    </div>
  );
}
