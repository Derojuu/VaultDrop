import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[11px] font-bold transition-colors",
                done && "border-vd-accent bg-vd-accent text-white",
                active && "border-vd-accent text-vd-accent2",
                !done && !active && "border-vd-bd2 text-vd-tx3",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-[12.5px] font-semibold sm:block",
                active ? "text-vd-tx" : "text-vd-tx3",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-px flex-1",
                  done ? "bg-vd-accent/60" : "bg-vd-bd",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
