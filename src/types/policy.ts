// Domain contract — กรมธรรม์ (insurance policy) สำหรับหน้า Policy Marketplace.

export type PolicyStatus =
  | "active" // มีผลบังคับ
  | "due_soon" // ใกล้ครบกำหนด
  | "awaiting" // รอชำระเบี้ย
  | "lapsed" // ขาดอายุ
  | "cancelled"; // ยกเลิก

export type PremiumFrequency = "monthly" | "quarterly" | "yearly";

/** ประเภทประกันภัย (ภาคสมัครใจ VMI / ภาคบังคับ CMI). */
export type InsuranceKind = "VMI" | "CMI";

/** ประเภทเลขอ้างอิง (เลขกรมธรรม์ / เลขรับแจ้ง). */
export type ReferenceType = "policy" | "claim";

/** สถานะการตัดชำระเบี้ย: ยังไม่ตัด (N/A) หรือ ตัดแล้ว + วันที่ตัด (ISO). */
export interface DeductionStatus {
  state: "none" | "deducted";
  date?: string;
}

/** สถานะการชำระเงิน VCP: ว่าง / รอชำระเงิน / ชำระสำเร็จ. */
export type VcpStatus = "none" | "awaiting" | "paid";

export interface Policy {
  /** เลขกรมธรรม์ เช่น POL-2401170 */
  id: string;
  /** เริ่มคุ้มครอง (ISO yyyy-mm-dd) */
  effectiveDate: string;
  /** สิ้นสุดคุ้มครอง (ISO yyyy-mm-dd) */
  coverageEnd: string;
  customer: { name: string; phone: string; email?: string; nationalId?: string };
  /** ประเภท + ชื่อแผน */
  product: { type: string; plan?: string };
  /** ที่มา: รหัสช่องทาง (เช่น KKC) + ชื่อช่องทาง/สาขา */
  source: { code: string; channel: string };
  /** ประเภทประกันภัย ภาคสมัครใจ/ภาคบังคับ */
  insuranceKind: InsuranceKind;
  /** ประเภทเลขอ้างอิง */
  referenceType: ReferenceType;
  /** หมายเลขกรมธรรม์/รับแจ้ง/สลักหลัง เช่น "06303-69100/รย/023880" */
  referenceNo: string;
  /** ข้อมูลเพิ่มเติม (ทะเบียนรถ ฯลฯ) + tooltip ถ้ามี */
  extraInfo: { text: string; tooltip?: string };
  /** ทุนประกัน */
  sumInsured: number;
  /** เบี้ย/งวด — ยอดที่ตะกร้ารับชำระเก็บ (= totalAmount) */
  premium: number;
  /** เบี้ยสุทธิ */
  netPremium: number;
  /** เบี้ยรวม/จำนวนเงิน (บาท) */
  totalAmount: number;
  frequency: PremiumFrequency;
  /** งวดถัดไป: วันที่ครบกำหนด (ISO) + เลขงวด */
  nextDue: { date: string; installmentNo: number };
  /** สถานะการตัดชำระเบี้ย */
  deduction: DeductionStatus;
  /** สถานะการชำระเงิน (VCP) */
  vcp: VcpStatus;
  status: PolicyStatus;
}
