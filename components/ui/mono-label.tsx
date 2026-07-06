import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type MonoLabelProps = ComponentProps<"span"> & {
  /** Accent-tinted variant used for section eyebrows. */
  tone?: "muted" | "accent";
};

/**
 * The reference's signature technical micro-label: IBM Plex Mono, uppercase,
 * wide tracking. Used for section eyebrows, stat captions, spec chips.
 */
export function MonoLabel({
  className,
  tone = "muted",
  ...props
}: MonoLabelProps) {
  return (
    <span
      data-slot="mono-label"
      className={cn(
        "mono-label",
        tone === "accent" && "text-vd-accent2",
        className,
      )}
      {...props}
    />
  );
}
