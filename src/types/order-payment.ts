import type { Money } from "@/types/money";

// ponytail: filename is order-payment.ts (not order.ts) because the Minimals demo
// module already owns src/types/order.ts with a different Order shape. No file imports
// both, so reusing the `Order` symbol name here is safe.
export type OrderStatus = "AwaitingPayment" | "Paid" | "Cancelled";
export type PaymentSessionStatus = "Created" | "Redirected" | "Paid" | "Failed" | "Expired";

export type PaymentChannel = "card" | "promptpay" | "installment";
export type Psp = "omise" | "2c2p";

export interface PaymentSessionItem { name: string; amount: Money; }

export interface PaymentSession {
  id: string;            // = code, ใช้เป็น key
  code: string;          // "TXN-2026-100000"
  recipientEmail: string | null;
  source: { code: string; label: string };  // ที่มา เช่น { code: "CPK", label: "ชยพร โกศลกิจ" }
  channel: PaymentChannel;
  psp: Psp;
  amount: Money;
  status: PaymentSessionStatus;
  time: string;          // "14:29"
  subItems: number;      // จำนวนรายการย่อย
  items: PaymentSessionItem[]; // length === subItems, sum(amount) === amount
}

export interface Order {
  id: string;
  amount: Money;
  status: OrderStatus;
  paymentSessionId: string | null;
}
