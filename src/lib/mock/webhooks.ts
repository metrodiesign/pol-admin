import type { WebhookEvent, WebhookEndpoint } from "@/types/webhook";

export const WEBHOOK_EVENTS: WebhookEvent[] = [
  { id: "evt_8a72b1", type: "payment.succeeded", txn: "TXN-2026-100023", psp: "2C2P", status: "delivered", attempts: 1, ts: "14:31:18", latency: "142ms" },
  { id: "evt_8a71fc", type: "payment.captured", txn: "TXN-2026-100022", psp: "Omise", status: "delivered", attempts: 1, ts: "14:28:04", latency: "186ms" },
  { id: "evt_8a7184", type: "payment.pending", txn: "TXN-2026-100021", psp: "2C2P", status: "delivered", attempts: 1, ts: "14:25:47", latency: "210ms" },
  { id: "evt_8a70d2", type: "payment.failed", txn: "TXN-2026-100020", psp: "2C2P", status: "retrying", attempts: 3, ts: "14:21:33", latency: "5.2s" },
  { id: "evt_8a708a", type: "payment.refunded", txn: "TXN-2026-100018", psp: "Omise", status: "delivered", attempts: 1, ts: "14:18:11", latency: "198ms" },
  { id: "evt_8a7044", type: "link.viewed", txn: "PLK-050018", psp: "—", status: "delivered", attempts: 1, ts: "14:14:02", latency: "88ms" },
  { id: "evt_8a6f9e", type: "payment.succeeded", txn: "TXN-2026-100017", psp: "2C2P", status: "delivered", attempts: 1, ts: "14:11:55", latency: "156ms" },
  { id: "evt_8a6f01", type: "payment.voided", txn: "TXN-2026-100016", psp: "Omise", status: "failed", attempts: 5, ts: "14:08:21", latency: "—" },
  { id: "evt_8a6e88", type: "payment.authorized", txn: "TXN-2026-100015", psp: "2C2P", status: "delivered", attempts: 1, ts: "14:04:19", latency: "124ms" },
];

export const WEBHOOK_ENDPOINTS: WebhookEndpoint[] = [
  { id: 1, url: "https://policy-core.insurer.co.th/api/v2/payments/webhook", events: ["payment.*"], status: "active", successRate: 99.6 },
  { id: 2, url: "https://renewal-portal.insurer.co.th/webhooks/centropay", events: ["payment.succeeded", "payment.refunded"], status: "active", successRate: 99.2 },
  { id: 3, url: "https://crm.insurer.co.th/integrations/payment-events", events: ["payment.succeeded", "link.viewed"], status: "active", successRate: 98.4 },
  { id: 4, url: "https://staging.insurer.co.th/webhooks/cpay-test", events: ["*"], status: "paused", successRate: 94.1 },
];
