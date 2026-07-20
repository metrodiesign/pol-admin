import type { WebhookDeliveryStatus, WebhookPsp } from "@/types/webhook-event";
import type { Tone } from "@/lib/control/status";

export const PSP_LABEL: Record<WebhookPsp, string> = {
  omise: "Omise",
  "2c2p": "2C2P",
};

export const DELIVERY_LABEL: Record<WebhookDeliveryStatus, string> = {
  delivered: "ส่งสำเร็จ",
  failed: "ส่งล้มเหลว",
  pending: "รอส่ง",
};

export function deliveryTone(status: WebhookDeliveryStatus): Tone {
  switch (status) {
    case "delivered":
      return "ok";
    case "failed":
      return "error";
    case "pending":
      return "warn";
  }
}

/** Event types for the filter dropdown — covers the payment lifecycle. */
export const EVENT_TYPES = [
  "payment.succeeded",
  "payment.failed",
  "payment.pending",
  "charge.expired",
] as const;
