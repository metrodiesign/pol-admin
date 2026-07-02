// ponytail: filename is order-payment.ts (not order.ts) because the Minimals demo
// module already owns src/types/order.ts with a different Order shape. No file imports
// both, so reusing the `Order` symbol name here is safe.
export type OrderStatus =
  | "completed"   // สำเร็จ
  | "pending"     // รอชำระ
  | "processing"  // กำลังประมวลผล
  | "failed"      // ล้มเหลว
  | "refunded"    // คืนเงิน
  | "cancelled";  // ยกเลิก

export type PaymentChannel = "card" | "promptpay" | "installment";
export type Psp = "omise" | "2c2p";

export interface OrderItem { name: string; amount: number; }

export interface Order {
  id: string;            // = code, ใช้เป็น key
  code: string;          // "TXN-2026-100000"
  customerName: string;
  customerEmail: string;
  source: { code: string; label: string };  // ที่มา เช่น { code: "CPK", label: "ชยพร โกศลกิจ" }
  channel: PaymentChannel;
  psp: Psp;
  amount: number;        // บาท
  status: OrderStatus;
  time: string;          // "14:29"
  subItems: number;      // จำนวนรายการย่อย
  items: OrderItem[]; // length === subItems, sum(amount) === amount
}
