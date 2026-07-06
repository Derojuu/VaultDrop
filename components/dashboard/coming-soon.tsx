import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col">
      <div className="surface flex flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-14 place-items-center rounded-[16px] border">
          <Icon className="size-6" />
        </span>
        <div className="flex items-center gap-2.5">
          <h2 className="text-vd-tx text-[22px] font-extrabold tracking-[-0.02em]">
            {title}
          </h2>
          <Badge variant="accent">Soon</Badge>
        </div>
        <p className="text-vd-tx2 max-w-[400px] text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
