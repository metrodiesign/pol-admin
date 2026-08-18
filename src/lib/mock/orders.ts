// UI-only, ไม่มี read endpoint รองรับ — `Order` เองตรง `OrderSummaryResponse` จริง
// (REQ-8) แต่ `OrderRow`/`ORDER_ROWS` ด้านล่าง join กับ `PaymentSession` เพิ่มเพื่อ
// UI เท่านั้น ไม่มี endpoint ที่คืนแบบ join นี้ ต้องเรียก Order + PaymentSession
// endpoint แยกกันจริงก่อนถึงจะ align ได้ (REQ-7.2).
import type { Order, OrderStatus, PaymentSessionStatus } from "@/types/order-payment";
import { PAYMENT_SESSIONS } from "@/lib/mock/transactions";

// เฉพาะ session เดิมมาจากสถานะเงินคืนที่ตัดออกไปแล้ว — ปิด OQ-A: session สำเร็จ (Paid) แต่ order ถูกยกเลิกภายหลัง
// (Cancelled). แถวอื่นทั้งหมดใช้ default rule ด้านล่าง ไม่ต้องมี entry ที่นี่.
const ORDER_STATUS_OVERRIDE: Record<string, OrderStatus> = {
  "ORD6900000021": "Cancelled",
  "ORD6900000036": "Cancelled",
  "ORD6900000047": "Cancelled",
};

function defaultOrderStatus(s: PaymentSessionStatus): OrderStatus {
  switch (s) {
    case "Paid": return "Paid";
    case "Created":
    case "Redirected":
    case "Failed": return "AwaitingPayment";
    case "Expired": return "Cancelled";
  }
}

export const ORDERS: Order[] = PAYMENT_SESSIONS.map((s) => ({
  id: s.id,
  amount: s.amount,
  status: ORDER_STATUS_OVERRIDE[s.id] ?? defaultOrderStatus(s.status),
  paymentSessionId: s.id,
}));

export const ORDER_SUMMARY = {
  totalToday: 2498,
  grossAmount: 16_580_000,
  pspFee: 412_140,
  netAmount: 16_130_000,
};
