import type { TenantId } from "@/types/tenant";

export type WebhookPsp = "omise" | "2c2p";
export type WebhookDeliveryStatus = "delivered" | "failed" | "pending";

/**
 * A single inbound webhook event from a PSP — the source of truth for payment
 * status. Every confirmed payment status the platform shows traces back to a
 * verified event here. The signature is verified at the boundary before the
 * event is trusted; `payload` is a pretty-printed JSON snapshot for inspection.
 */
export interface WebhookEvent {
  id: string; // "evt_..."
  eventType: string; // e.g. "payment.succeeded"
  psp: WebhookPsp;
  tenantId: TenantId;
  deliveryStatus: WebhookDeliveryStatus;
  attempts: number;
  signatureVerified: boolean;
  receivedAt: string; // ISO datetime
  payload: string; // pretty JSON string
}
