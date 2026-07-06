import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-vd-bd2 bg-vd-card2 text-vd-tx flex h-11 w-full rounded-[11px] border px-3.5 py-2 text-sm transition-colors outline-none",
        "placeholder:text-vd-tx3",
        "focus-visible:border-vd-accent/60 focus-visible:ring-vd-accent/30 focus-visible:ring-2",
        "file:text-vd-tx2 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-vd-dng/60 aria-[invalid=true]:ring-vd-dng/25",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
