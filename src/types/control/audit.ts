import type { MerchantCode } from "@/types/merchant";

export type AuditResult = "success" | "denied";

/**
 * One immutable entry in the audit trail — a record of a sensitive action taken
 * in the control plane. The trail is append-only: entries are never edited or
 * deleted, only read. `before`/`after` capture the changed state as JSON strings
 * for actions that mutate configuration (routing, roles, credentials).
 */
export interface AuditEntry {
  id: string; // "AUD-000142"
  timestamp: string; // ISO datetime
  actor: string; // operator email
  action: string; // dotted action key, e.g. "psp.credential.rotate"
  entityId: string; // the affected resource id
  merchantId: MerchantCode;
  result: AuditResult;
  ip: string;
  before?: string; // JSON string — prior state (mutating actions only)
  after?: string; // JSON string — new state (mutating actions only)
}
