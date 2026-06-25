import type { TenantId } from "@/types/tenant";

export type SettlementPsp = "omise" | "2c2p";
export type SettlementMatchStatus = "matched" | "variance" | "unreconciled";

export interface SettlementLineItem {
  ref: string; // charge / order reference
  amount: number; // THB, settled to the company
}

/**
 * One settlement batch: a PSP pays out a window of charges to the company's bank
 * account directly. The platform never holds the money — it only reconciles what
 * the PSP reports as settled against what the platform expected for that window.
 * `matchStatus` is derived (matchSettlement) for matched/variance; `unreconciled`
 * means the PSP report has not arrived yet (reported is still 0 / pending).
 */
export interface SettlementBatch {
  id: string; // "STL-VCTL-OMISE-20260623"
  batchRef: string; // PSP-issued batch reference (machine id)
  psp: SettlementPsp;
  tenantId: TenantId;
  expected: number; // what the platform expected to settle
  reported: number; // what the PSP reported as settled
  matchStatus: SettlementMatchStatus;
  settledAt: string; // ISO datetime, or "" if not settled yet
  lineItems: SettlementLineItem[];
}
