"use client";

import type { WebhookEvent } from "@/types/webhook-event";
import { WEBHOOK_EVENTS } from "@/lib/mock/webhook-events";
import { createControlStore } from "./store";

export const webhookStore = createControlStore<WebhookEvent>(WEBHOOK_EVENTS);

/** Replay re-delivers the event: status → delivered, one more attempt, signature verified. */
export function replayEvent(id: string) {
  webhookStore.update(id, (e) => ({
    ...e,
    deliveryStatus: "delivered",
    attempts: e.attempts + 1,
    signatureVerified: true,
  }));
}
