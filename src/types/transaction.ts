export type TransactionStatus =
  | "completed"   // สำเร็จ
  | "pending"     // รอชำระ
  | "processing"  // กำลังประมวลผล
  | "failed"      // ล้มเหลว
  | "refunded"    // คืนเงิน
  | "cancelled";  // ยกเลิก

export type PaymentChannel = "card" | "promptpay" | "installment";
export type Psp = "omise" | "2c2p";

export interface TransactionItem { name: string; amount: number; }

export interface Transaction {
  id: string;            // = code, ใช้เป็น key
  code: string;          // "TXN-2026-100000"
  customerName: string;
  customerEmail: string;
  source: { code: string; label: string };  // ที่มา เช่น { code: "CPK", label: "ชยพร โกศลกิจ" }
  channel: PaymentChannel;
  psp: Psp;
  amount: number;        // บาท
  status: TransactionStatus;
  time: string;          // "14:29"
  subItems: number;      // จำนวนรายการย่อย
  items: TransactionItem[]; // length === subItems, sum(amount) === amount
}
