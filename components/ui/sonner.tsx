"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App toaster. Colors are pinned to the VaultDrop palette via CSS vars so
 * toasts match the dark surface language regardless of the resolved theme.
 */
export function Toaster({ ...props }: ToasterProps) {
  const { theme = "dark" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      style={
        {
          "--normal-bg": "var(--vd-card)",
          "--normal-text": "var(--vd-tx)",
          "--normal-border": "var(--vd-bd2)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "font-sans",
          description: "text-vd-tx2",
        },
      }}
      {...props}
    />
  );
}
