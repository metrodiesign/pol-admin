import type { MerchantCode } from "@/types/merchant";

export type NotificationChannel = "email" | "webhook" | "inapp";
export type NotificationLogStatus = "sent" | "failed";

/**
 * An alert rule: which platform event (payment/webhook/settlement) notifies whom,
 * through which channel. Operators toggle rules on/off; `threshold` is an optional
 * qualifier (e.g. amount or variance) for events that only fire above a bound.
 */
export interface NotificationRule {
  id: string; // "NTF-RULE-001"
  event: string; // e.g. "payment.failed", "webhook.delivery.failed", "settlement.variance"
  channel: NotificationChannel;
  target: string; // email address or webhook URL
  threshold?: string; // optional qualifier, e.g. "> ฿50,000"
  merchantId: MerchantCode;
  enabled: boolean;
}

/** One delivery attempt of a notification — the audit trail for the rules above. */
export interface NotificationLogEntry {
  id: string; // "NTF-LOG-001"
  event: string;
  channel: NotificationChannel;
  target: string;
  status: NotificationLogStatus;
  sentAt: string; // ISO datetime
}
