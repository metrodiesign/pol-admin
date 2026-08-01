// Pure domain logic สำหรับหน้า "ออกใบแจ้งหนี้ & สร้างลิงก์ชำระเงิน" — ไม่มี React, test ได้ตรง ๆ.
// แยกจาก presentation ตาม ARCHITECTURE.md (logic ไม่ฝังใน view).

import type { Policy } from "@/types/policy";

// ── rehydrate ตะกร้าจาก checkout session (localStorage) ─────────────────────

const CHECKOUT_SESSION_PREFIX = "pol-admin:checkout-session:";

/** สร้าง checkout session ใหม่ — เก็บ policy ids ลง localStorage, คืน session id. */
export function createCheckoutSession(ids: readonly string[]): string {
  const sessionId = crypto.randomUUID();
  localStorage.setItem(CHECKOUT_SESSION_PREFIX + sessionId, JSON.stringify(ids));
  return sessionId;
}

/** อ่าน policy ids จาก session id — ไม่พบ/parse ไม่ได้ = null. */
export function readCheckoutSession(sessionId: string): string[] | null {
  const raw = localStorage.getItem(CHECKOUT_SESSION_PREFIX + sessionId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return null;
  }
}

/**
 * เลือก Policy ตาม ids ที่ขอ — คงลำดับตาม ids, ตัด id ที่หาไม่เจอ, กันซ้ำ.
 */
export function pickPoliciesByIds(
  list: readonly Policy[],
  ids: readonly string[],
): Policy[] {
  const byId = new Map(list.map((p) => [p.id, p]));
  const seen = new Set<string>();
  const result: Policy[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const policy = byId.get(id);
    if (!policy) continue;
    seen.add(id);
    result.push(policy);
  }
  return result;
}

// ── โมเดลของหน้า checkout ───────────────────────────────────────────────────

/** ข้อมูลลูกค้า (ใช้แจ้งเตือน + ออกใบเสร็จ). */
export interface CustomerInfo {
  name: string;
  nationalId: string;
  email: string;
  phone: string;
}

/** แถวรายการกรมธรรม์ — เฉพาะ discount แก้ไขได้, ที่เหลือ display. */
export interface CheckoutLineItem {
  /** key คงที่สำหรับ React (= policy id) */
  uid: string;
  /** หมายเลขกรมธรรม์/รับแจ้ง/สลักหลัง (display) */
  policyNo: string;
  /** ชนิดเลขอ้างอิง (policy=เลขกรมธรรม์, claim=เลขรับแจ้ง) */
  referenceType: Policy["referenceType"];
  /** ชื่อ-นามสกุลผู้เอาประกัน (display) */
  payerName: string;
  /** เบี้ยสุทธิ (display) */
  netPremium: number;
  /** เบี้ยประกันภัยรวม (display) */
  grossPremium: number;
  /** ส่วนลด (บาท) — แก้ไขได้ */
  discount: number;
  /** ข้อมูลอ้างอิง เช่นทะเบียนรถ (display) */
  reference: string;
}

/** ช่องทางชำระที่อนุญาต (เลือกได้ 1). */
export type PaymentChannel = "credit_card" | "promptpay" | "installment";

/** อายุลิงก์ก่อนหมดอายุ. */
export type LinkExpiry = "24h" | "48h" | "72h" | "7d";

/** โหมดแจ้งเตือนลูกค้า. */
export type NotifyMode = "send_customer" | "none";

export const PAYMENT_CHANNEL_OPTIONS: {
  value: PaymentChannel;
  label: string;
  caption: string;
}[] = [
  { value: "credit_card", label: "บัตรเครดิต / เดบิต", caption: "Visa, Mastercard, JCB, UnionPay" },
  { value: "promptpay", label: "PromptPay QR", caption: "สแกนจากแอปธนาคารได้ก็ได้" },
  { value: "installment", label: "ผ่อนชำระ", caption: "KBank, KTC, BBL, BAY" },
];

export const LINK_EXPIRY_OPTIONS: { value: LinkExpiry; label: string; hours: number }[] = [
  { value: "24h", label: "24 ชม.", hours: 24 },
  { value: "48h", label: "48 ชม.", hours: 48 },
  { value: "72h", label: "72 ชม.", hours: 72 },
  { value: "7d", label: "7 วัน", hours: 168 },
];

export const NOTIFY_MODE_OPTIONS: { value: NotifyMode; label: string }[] = [
  { value: "send_customer", label: "ส่งหาลูกค้า" },
  { value: "none", label: "ไม่ส่งแจ้งเตือน" },
];

/** คำบรรยายอายุลิงก์สำหรับ footer เช่น "ลิงก์มีอายุ 72 ชั่วโมง". */
export function expiryDescription(expiry: LinkExpiry): string {
  const opt = LINK_EXPIRY_OPTIONS.find((o) => o.value === expiry);
  if (!opt) return "";
  return expiry.endsWith("d")
    ? `ลิงก์มีอายุ ${opt.hours / 24} วัน`
    : `ลิงก์มีอายุ ${opt.hours} ชั่วโมง`;
}

// ── derive จาก Policy ────────────────────────────────────────────────────────

/** แปลง Policy -> แถวรายการเริ่มต้น (uid = policy id, ส่วนลดเริ่ม 0). */
export function buildLineItem(p: Policy): CheckoutLineItem {
  return {
    uid: p.id,
    policyNo: p.referenceNo,
    referenceType: p.referenceType,
    payerName: p.customer.name,
    netPremium: p.netPremium,
    grossPremium: p.totalAmount,
    discount: 0,
    reference: p.extraInfo.text,
  };
}

/** %ส่วนลดจากเบี้ยสุทธิ — ระบบคำนวณ, ปัดเป็นจำนวนเต็ม. */
export function lineItemDiscountPct(item: CheckoutLineItem): number {
  if (item.netPremium <= 0) return 0;
  return round2((item.discount / item.netPremium) * 100);
}

/** ยอดชำระ = เบี้ยประกันภัยรวม − ส่วนลด. */
export function lineItemAmountDue(item: CheckoutLineItem): number {
  return round2(item.grossPremium - item.discount);
}

/** prefill ข้อมูลลูกค้าจากกรมธรรม์ใบแรก (email/nationalId อาจว่าง). */
export function buildCustomerInfo(p: Policy | undefined): CustomerInfo {
  return {
    name: p?.customer.name ?? "",
    nationalId: p?.customer.nationalId ?? "",
    email: p?.customer.email ?? "",
    phone: p?.customer.phone ?? "",
  };
}

// ── ยอดเงิน / ค่าธรรมเนียม ───────────────────────────────────────────────────

/** อัตราค่าธรรมเนียมโดยประมาณ (flat 2.5%). */
export const FEE_RATE = 0.025;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** ยอดที่ลูกค้าต้องชำระ = ผลรวมยอดชำระทุกแถว (เบี้ยรวม − ส่วนลด). */
export function lineItemsTotal(items: readonly CheckoutLineItem[]): number {
  return round2(items.reduce((acc, i) => acc + lineItemAmountDue(i), 0));
}

/** ค่าธรรมเนียมโดยประมาณ = 2.5% ของยอดรวม. */
export function estimateFee(total: number): number {
  return round2(total * FEE_RATE);
}

// ── validation ───────────────────────────────────────────────────────────────

/** regex อีเมลแบบง่าย — กันรูปแบบผิดชัด ๆ (ไม่ทำ RFC เต็ม). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ข้อมูลลูกค้าครบหรือไม่ (ชื่อ/เบอร์ required; อีเมล optional แต่ถ้ากรอกต้องถูกต้อง). */
export function isCustomerValid(c: CustomerInfo): boolean {
  const email = c.email.trim();
  return (
    c.name.trim().length > 0 &&
    c.phone.trim().length > 0 &&
    (email.length === 0 || EMAIL_RE.test(email))
  );
}

/** ออกใบแจ้งหนี้ได้หรือไม่: ลูกค้าครบ + มีรายการ + ส่วนลดถูกต้อง + ยอดรวม > 0. */
export function canIssue(input: {
  customer: CustomerInfo;
  items: readonly CheckoutLineItem[];
}): boolean {
  return (
    isCustomerValid(input.customer) &&
    input.items.length > 0 &&
    input.items.every((i) => i.discount >= 0 && i.discount <= i.grossPremium) &&
    lineItemsTotal(input.items) > 0
  );
}
