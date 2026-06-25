import { formatThaiShortDate } from "@/lib/utils";

/**
 * ISO datetime "2026-06-24T13:58:11" → "24 มิ.ย. 69 · 13:58".
 * Date-only or empty inputs degrade gracefully. Used across control logs
 * (webhooks, audit, settlements) so timestamps read the same everywhere.
 */
export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const [date, time] = iso.split("T");
  const datePart = formatThaiShortDate(date ?? iso);
  if (!time) return datePart;
  return `${datePart} · ${time.slice(0, 5)}`;
}
