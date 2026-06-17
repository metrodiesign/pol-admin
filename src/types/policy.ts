// Domain contract — กรมธรรม์ (insurance policy) สำหรับหน้า Policy Marketplace.

export type PolicyStatus =
  | "active" // มีผลบังคับ
  | "due_soon" // ใกล้ครบกำหนด
  | "awaiting" // รอชำระเบี้ย
  | "lapsed" // ขาดอายุ
  | "cancelled"; // ยกเลิก

export type PremiumFrequency = "monthly" | "quarterly" | "yearly";

export interface Policy {
  /** เลขกรมธรรม์ เช่น POL-2401170 */
  id: string;
  /** เริ่มคุ้มครอง (ISO yyyy-mm-dd) */
  effectiveDate: string;
  customer: { name: string; phone: string };
  /** ประเภท + ชื่อแผน */
  product: { type: string; plan?: string };
  /** ที่มา: รหัสช่องทาง (เช่น KKC) + ชื่อช่องทาง/สาขา */
  source: { code: string; channel: string };
  /** ทุนประกัน */
  sumInsured: number;
  /** เบี้ย/งวด */
  premium: number;
  frequency: PremiumFrequency;
  /** งวดถัดไป: วันที่ครบกำหนด (ISO) + เลขงวด */
  nextDue: { date: string; installmentNo: number };
  status: PolicyStatus;
}
