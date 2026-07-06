import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type Tone = "pos" | "warn" | "dng" | "accent" | "muted";

type StatusPillProps = ComponentProps<"span"> & {
  tone?: Tone;
  /** Show the glowing status dot (default true). */
  dot?: boolean;
};

/**
 * Glowing-dot status chip from the reference (e.g. "SYNCED", "PENDING").
 * Mono label + a colored, optionally-pulsing dot.
 */
export function StatusPill({
  className,
  tone = "muted",
  dot = true,
  children,
  ...props
}: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      className={cn(
        "border-vd-bd text-vd-tx2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.06em] uppercase",
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="status-dot"
          data-tone={tone === "muted" ? "pos" : tone}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
