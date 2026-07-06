/**
 * Typed design tokens — the single JS-side source of truth for brand colors.
 *
 * These mirror the CSS custom properties defined in `app/globals.css`. Use them
 * anywhere styling must happen in JS (Framer Motion animations, canvas/chart
 * fills, inline SVG gradients) so values never drift from the stylesheet.
 */

export const colors = {
  bg: "#0c0d0f",
  page: "#0a0b0d",
  panel: "#141519",
  card: "#1a1c22",
  card2: "#202329",
  side: "#101216",

  border: "rgba(255,255,255,0.08)",
  border2: "rgba(255,255,255,0.14)",

  tx: "#f3f4f6",
  tx2: "#a6abb4",
  tx3: "#878d98",

  accent: "#5e7cfa",
  accent2: "#9aa6ff",
  positive: "#35c77b",
  warning: "#e5b45c",
  danger: "#e5675c",
  public: "#8a93a2",
} as const;

export const glow = {
  accent: "0 16px 34px -14px rgba(94,124,250,0.8)",
  accentSoft: "0 10px 30px -10px rgba(94,124,250,0.5)",
} as const;

/** Shared Framer Motion easings matching the CSS `--ease-*` tokens. */
export const easing = {
  out: [0, 0, 0.2, 1] as const,
  emphasized: [0.2, 0.7, 0.2, 1] as const,
};

/** A reusable "rise + fade in" entrance for Framer Motion. */
export const riseIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easing.emphasized },
};

export type BrandColor = keyof typeof colors;
