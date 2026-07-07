import type { Recipient, VaultEvent } from "@/types";

/**
 * Audit-log data access — reads the attested access trail from /api/events and
 * the derived recipient list from /api/recipients.
 */

async function jsonFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ?? res.statusText;
    throw new Error(message);
  }
  return payload as T;
}

export async function listEvents(vaultId?: string): Promise<VaultEvent[]> {
  const qs = vaultId ? `?vaultId=${encodeURIComponent(vaultId)}` : "";
  const { events } = await jsonFetch<{ events: VaultEvent[] }>(
    `/api/events${qs}`,
  );
  return events;
}

export async function listRecipients(): Promise<Recipient[]> {
  const { recipients } = await jsonFetch<{ recipients: Recipient[] }>(
    "/api/recipients",
  );
  return recipients;
}
