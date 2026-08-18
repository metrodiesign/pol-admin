import type {
  NotificationChannel,
  NotificationLogStatus,
} from "@/types/control/notification";
import type { Tone } from "@/lib/control/status";

export const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  email: "อีเมล",
  webhook: "Webhook",
  inapp: "ในระบบ",
};

/**
 * Friendly Thai labels for the platform events an alert rule can subscribe to.
 * The raw event key (e.g. "payment.failed") stays as the machine identifier.
 */
export const EVENT_LABEL: Record<string, string> = {
  "payment.failed": "ชำระเงินล้มเหลว",
  "payment.succeeded": "ชำระเงินสำเร็จ",
  "webhook.delivery.failed": "ส่ง Webhook ล้มเหลว",
  "settlement.variance": "ยอดกระทบยอดไม่ตรง",
  "settlement.summary.generated": "สรุปกระทบยอดพร้อมแล้ว",
  "refund.requested": "ขอคืนเงิน",
};

/** Fall back to the raw key if an event has no Thai label yet. */
export function eventLabel(event: string): string {
  return EVENT_LABEL[event] ?? event;
}

export const LOG_STATUS_LABEL: Record<NotificationLogStatus, string> = {
  sent: "ส่งสำเร็จ",
  failed: "ส่งล้มเหลว",
};

export function logTone(status: NotificationLogStatus): Tone {
  switch (status) {
    case "sent":
      return "ok";
    case "failed":
      return "error";
  }
}
