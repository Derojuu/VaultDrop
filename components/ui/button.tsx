import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:ring-vd-accent/70 focus-visible:ring-offset-vd-bg inline-flex shrink-0 items-center justify-center gap-2 rounded-[12px] text-sm font-bold whitespace-nowrap transition-[transform,box-shadow,border-color,background-color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-vd-accent text-white shadow-[0_16px_34px_-14px_rgba(94,124,250,0.8)] hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-14px_rgba(94,124,250,0.9)]",
        secondary:
          "border-vd-bd2 bg-vd-card text-vd-tx hover:border-vd-accent/50 border hover:-translate-y-0.5",
        outline:
          "border-vd-bd2 text-vd-tx hover:border-vd-accent/50 border bg-transparent hover:bg-white/[0.03]",
        ghost: "text-vd-tx2 hover:text-vd-tx hover:bg-white/[0.05]",
        destructive:
          "bg-vd-dng text-white shadow-[0_16px_34px_-14px_rgba(229,103,92,0.7)] hover:-translate-y-0.5",
        link: "text-vd-accent2 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-[10px] px-3.5 text-[13px]",
        lg: "h-12 rounded-[13px] px-6 text-[15px]",
        icon: "size-11",
        "icon-sm": "size-9 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
