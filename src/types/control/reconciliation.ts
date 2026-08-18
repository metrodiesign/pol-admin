import type { OrderStatus } from "@/types/order-payment";

/**
 * Matches `ReconciliationLine(string Status, string Currency, int Count, decimal Total)` /
 * `ReconciliationView { lines: ReconciliationLine[] }` exactly — no other fields at all
 * (pol-core has no batch/reconcile-matching concept for orders, REQ-6.4).
 * `total` is a plain number, not `Money` — pol-core sends `decimal` + `currency` as separate fields (REQ-1.7).
 */
export interface ReconciliationLine {
  status: OrderStatus;
  currency: string;
  count: number;
  total: number;
}
