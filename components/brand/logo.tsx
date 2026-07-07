"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * VaultDrop brand mark — a vault dial with a keyhole. Reads as a safe/vault
 * mechanism (on-theme for "sealed files"), and its radial symmetry means it
 * rotates cleanly when used as the hero backdrop. Indigo accent to match the
 * VaultDrop palette.
 */
export function LogoMark({ className }: { className?: string }) {
  const raw = useId().replace(/:/g, "");
  const g = `vdg-${raw}`;
  const gi = `vdgi-${raw}`;

  // 12 dial notches around the ring.
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("block size-8", className)}
      fill="none"
      role="img"
      aria-label="VaultDrop"
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9aa6ff" />
          <stop offset="1" stopColor="#5e7cfa" />
        </linearGradient>
        <radialGradient id={gi} cx="0.5" cy="0.38" r="0.75">
          <stop offset="0" stopColor="#242747" />
          <stop offset="1" stopColor="#111220" />
        </radialGradient>
      </defs>

      {/* Dial notches */}
      <g
        stroke={`url(#${g})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.85"
      >
        {ticks.map((a) => (
          <line
            key={a}
            x1="50"
            y1="4.5"
            x2="50"
            y2="11"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
      </g>

      {/* Outer ring */}
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke={`url(#${g})`}
        strokeWidth="2.5"
        opacity="0.9"
      />

      {/* Dial face */}
      <circle
        cx="50"
        cy="50"
        r="33"
        fill={`url(#${gi})`}
        stroke={`url(#${g})`}
        strokeWidth="1.5"
      />

      {/* Keyhole */}
      <circle cx="50" cy="44" r="6.5" fill={`url(#${g})`} />
      <path d="M46.5 47 L44 61 L56 61 L53.5 47 Z" fill={`url(#${g})`} />

      {/* Dial indicator */}
      <circle cx="50" cy="7.5" r="3.2" fill="#9aa6ff" />
    </svg>
  );
}

export function Logo({
  className,
  withWordmark = true,
  markClassName,
  wordmarkClassName,
}: {
  className?: string;
  withWordmark?: boolean;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      {withWordmark && (
        <span
          className={cn(
            "text-vd-tx text-[15px] font-extrabold tracking-[-0.02em]",
            wordmarkClassName,
          )}
        >
          VaultDrop
        </span>
      )}
    </span>
  );
}
