export type WebhookDeliveryStatus = "delivered" | "retrying" | "failed";
export type WebhookEndpointStatus = "active" | "paused";

export interface WebhookEvent {
  id: string;
  type: string;
  txn: string;
  psp: string;
  status: WebhookDeliveryStatus;
  attempts: number;
  ts: string;
  latency: string;
}

export interface WebhookEndpoint {
  id: number;
  url: string;
  events: string[];
  status: WebhookEndpointStatus;
  successRate: number;
}
