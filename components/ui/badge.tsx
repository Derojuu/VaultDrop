import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9.5px] leading-none font-bold tracking-[0.12em] uppercase transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-vd-bd2 text-vd-tx2 bg-white/[0.04]",
        accent: "border-vd-accent/45 bg-vd-accent/15 text-vd-accent2",
        success: "border-vd-pos/40 bg-vd-pos/10 text-vd-pos",
        warning: "border-vd-warn/40 bg-vd-warn/10 text-vd-warn",
        danger: "border-vd-dng/40 bg-vd-dng/10 text-vd-dng",
        outline: "border-vd-bd text-vd-tx3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
