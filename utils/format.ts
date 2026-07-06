/**
 * Pure, dependency-free formatting helpers.
 * (Infrastructure/clients live in `lib/`; only pure functions belong here.)
 */

/** Human-readable file size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}

/** Middle-truncate long strings like wallet addresses: "0x1234…abcd". */
export function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Locale date, e.g. "Jul 5, 2026". */
export function formatDate(input: string | number | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

/** Compact relative time, e.g. "3h ago", "2d ago". */
export function formatRelativeTime(input: string | number | Date): string {
  const then = new Date(input).getTime();
  const diff = Date.now() - then;
  const abs = Math.abs(diff);
  const table: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
    ["second", 1000],
  ];
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  for (const [unit, ms] of table) {
    if (abs >= ms || unit === "second") {
      return rtf.format(-Math.round(diff / ms), unit);
    }
  }
  return "just now";
}

/** Pluralize a noun by count: pluralize(2, "vault") -> "2 vaults". */
export function pluralize(count: number, noun: string, suffix = "s"): string {
  return `${count} ${noun}${count === 1 ? "" : suffix}`;
}
