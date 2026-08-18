import type { ReconciliationLine } from "@/types/control/reconciliation";

/**
 * Flat summary — no merchant field per row (REQ-6.7): pol-core's
 * `GetReconciliationSummaryQuery` is merchant-scoped (RLS), so a cross-merchant
 * breakdown per row is not something a single call can return. One currency
 * per line (no cross-currency aggregation, REQ-6.6) — THB only across this mock.
 */
export const RECONCILIATION_LINES: ReconciliationLine[] = [
  { status: "Paid", currency: "THB", count: 214, total: 1842650.5 },
  { status: "AwaitingPayment", currency: "THB", count: 18, total: 96420 },
  { status: "Cancelled", currency: "THB", count: 9, total: 41300 },
];
