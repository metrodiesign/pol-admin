import type { MerchantCode } from "@/types/merchant";
import type { WebhookEvent } from "@/types/webhook-event";

// UI-only, ไม่มี endpoint รองรับ — pol-core ไม่มี webhook-event read endpoint
// เลย ต้องมี endpoint นี้ก่อนถึงจะ align ได้ (REQ-7.2).
// Deterministic seed — fake events only. Payloads are pretty-printed at module
// load (JSON.stringify with 2-space indent) so the raw block reads like a real
// PSP payload without committing a wall of literal JSON.
function payload(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

export const WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    id: "evt_5f8a2c9d4e7b3f16",
    eventType: "payment.succeeded",
    psp: "omise",
    merchantId: "vprivilege",
    deliveryStatus: "delivered",
    attempts: 1,
    signatureVerified: true,
    receivedAt: "2026-06-24T13:58:11",
    payload: payload({
      id: "evt_5f8a2c9d4e7b3f16",
      type: "payment.succeeded",
      object: "event",
      data: {
        chargeId: "chrg_test_61f8a2c9d4",
        amount: 489000,
        currency: "THB",
        status: "successful",
        paid: true,
      },
    }),
  },
  {
    id: "evt_7b3f1602d9e4a2c9",
    eventType: "payment.failed",
    psp: "omise",
    merchantId: "vprivilege",
    deliveryStatus: "failed",
    attempts: 4,
    signatureVerified: true,
    receivedAt: "2026-06-24T13:41:55",
    payload: payload({
      id: "evt_7b3f1602d9e4a2c9",
      type: "payment.failed",
      object: "event",
      data: {
        chargeId: "chrg_test_7b3f1602d9",
        amount: 129000,
        currency: "THB",
        status: "failed",
        failureCode: "insufficient_fund",
      },
    }),
  },
  {
    id: "evt_88c1f0a7e2d5b9c3",
    eventType: "payment.succeeded",
    psp: "2c2p",
    merchantId: "vprivilege",
    deliveryStatus: "delivered",
    attempts: 1,
    signatureVerified: true,
    receivedAt: "2026-06-24T12:20:03",
    payload: payload({
      id: "evt_88c1f0a7e2d5b9c3",
      type: "payment.succeeded",
      merchantID: "merchant_457012_live",
      paymentResponse: {
        invoiceNo: "INV-2026-008812",
        amount: 76500,
        currencyCode: "THB",
        respCode: "0000",
        respDesc: "Success",
      },
    }),
  },
  {
    id: "evt_a2c9d4e7b3f1602d",
    eventType: "payment.pending",
    psp: "omise",
    merchantId: "vcommerce",
    deliveryStatus: "pending",
    attempts: 0,
    signatureVerified: true,
    receivedAt: "2026-06-24T11:12:47",
    payload: payload({
      id: "evt_a2c9d4e7b3f1602d",
      type: "payment.pending",
      object: "event",
      data: {
        chargeId: "chrg_test_a2c9d4e7b3",
        amount: 215000,
        currency: "THB",
        status: "pending",
        source: "promptpay",
      },
    }),
  },
  {
    id: "evt_d4e7b3f1602d9e4a",
    eventType: "charge.expired",
    psp: "omise",
    merchantId: "vcommerce",
    deliveryStatus: "delivered",
    attempts: 1,
    signatureVerified: true,
    receivedAt: "2026-06-24T10:48:29",
    payload: payload({
      id: "evt_d4e7b3f1602d9e4a",
      type: "charge.expired",
      object: "event",
      data: {
        chargeId: "chrg_test_d4e7b3f160",
        amount: 50000,
        currency: "THB",
        status: "expired",
      },
    }),
  },
  {
    id: "evt_61f8a2c9d4e7b3f1",
    eventType: "payment.succeeded",
    psp: "omise",
    merchantId: "vcommerce",
    deliveryStatus: "delivered",
    attempts: 2,
    signatureVerified: true,
    receivedAt: "2026-06-24T09:33:14",
    payload: payload({
      id: "evt_61f8a2c9d4e7b3f1",
      type: "payment.succeeded",
      object: "event",
      data: {
        chargeId: "chrg_test_61f8a2c9d4e7",
        amount: 998000,
        currency: "THB",
        status: "successful",
        paid: true,
      },
    }),
  },
  {
    id: "evt_902145d9e4a2c9d4",
    eventType: "payment.failed",
    psp: "2c2p",
    merchantId: "vsouvenir",
    deliveryStatus: "failed",
    attempts: 6,
    signatureVerified: false,
    receivedAt: "2026-06-24T08:51:40",
    payload: payload({
      id: "evt_902145d9e4a2c9d4",
      type: "payment.failed",
      merchantID: "merchant_902145_live",
      paymentResponse: {
        invoiceNo: "INV-2026-008790",
        amount: 34000,
        currencyCode: "THB",
        respCode: "2001",
        respDesc: "Authentication failed",
      },
    }),
  },
  {
    id: "evt_1602d9e4a2c9d4e7",
    eventType: "charge.expired",
    psp: "2c2p",
    merchantId: "vsouvenir",
    deliveryStatus: "delivered",
    attempts: 1,
    signatureVerified: true,
    receivedAt: "2026-06-23T22:05:18",
    payload: payload({
      id: "evt_1602d9e4a2c9d4e7",
      type: "charge.expired",
      merchantID: "merchant_902145_live",
      paymentResponse: {
        invoiceNo: "INV-2026-008771",
        amount: 18900,
        currencyCode: "THB",
        respCode: "0003",
        respDesc: "Transaction expired",
      },
    }),
  },
  {
    id: "evt_3f1602d9e4a2c9d4",
    eventType: "payment.succeeded",
    psp: "2c2p",
    merchantId: "vsouvenir",
    deliveryStatus: "delivered",
    attempts: 1,
    signatureVerified: true,
    receivedAt: "2026-06-23T19:40:02",
    payload: payload({
      id: "evt_3f1602d9e4a2c9d4",
      type: "payment.succeeded",
      merchantID: "merchant_902145_test",
      paymentResponse: {
        invoiceNo: "INV-2026-008744",
        amount: 12500,
        currencyCode: "THB",
        respCode: "0000",
        respDesc: "Success",
      },
    }),
  },
  {
    id: "evt_e2d5b9c3f0a7e2d5",
    eventType: "payment.pending",
    psp: "omise",
    merchantId: "vprivilege",
    deliveryStatus: "pending",
    attempts: 0,
    signatureVerified: true,
    receivedAt: "2026-06-23T17:22:33",
    payload: payload({
      id: "evt_e2d5b9c3f0a7e2d5",
      type: "payment.pending",
      object: "event",
      data: {
        chargeId: "chrg_test_e2d5b9c3f0",
        amount: 67000,
        currency: "THB",
        status: "pending",
        source: "internet_banking",
      },
    }),
  },
  {
    id: "evt_b9c3f0a7e2d5b9c3",
    eventType: "payment.failed",
    psp: "omise",
    merchantId: "vcommerce",
    deliveryStatus: "failed",
    attempts: 3,
    signatureVerified: true,
    receivedAt: "2026-06-23T15:09:57",
    payload: payload({
      id: "evt_b9c3f0a7e2d5b9c3",
      type: "payment.failed",
      object: "event",
      data: {
        chargeId: "chrg_test_b9c3f0a7e2",
        amount: 305000,
        currency: "THB",
        status: "failed",
        failureCode: "stolen_or_lost_card",
      },
    }),
  },
  {
    id: "evt_d9e4a2c9d4e7b3f1",
    eventType: "charge.expired",
    psp: "2c2p",
    merchantId: "vprivilege",
    deliveryStatus: "delivered",
    attempts: 1,
    signatureVerified: true,
    receivedAt: "2026-06-23T11:47:21",
    payload: payload({
      id: "evt_d9e4a2c9d4e7b3f1",
      type: "charge.expired",
      merchantID: "merchant_457012_live",
      paymentResponse: {
        invoiceNo: "INV-2026-008702",
        amount: 42000,
        currencyCode: "THB",
        respCode: "0003",
        respDesc: "Transaction expired",
      },
    }),
  },
];

export interface WebhookEndpoint {
  merchantId: MerchantCode;
  url: string;
  deliveredToday: number;
  failedToday: number;
}

export const WEBHOOK_ENDPOINTS: WebhookEndpoint[] = [
  {
    merchantId: "vprivilege",
    url: "https://api.vprivilege.co.th/webhooks/psp",
    deliveredToday: 412,
    failedToday: 3,
  },
  {
    merchantId: "vcommerce",
    url: "https://pay.vcommerce.co.th/hooks/inbound",
    deliveredToday: 287,
    failedToday: 1,
  },
  {
    merchantId: "vsouvenir",
    url: "https://shop.vsouvenir.co.th/api/psp-events",
    deliveredToday: 64,
    failedToday: 5,
  },
];
