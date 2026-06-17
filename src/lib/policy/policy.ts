// Pure domain logic สำหรับ Policy Marketplace — ไม่มี React, test ได้ตรง ๆ.
// แยกจาก presentation ตาม ARCHITECTURE.md (logic ไม่ฝังใน view).

import type { Policy, PolicyStatus } from "@/types/policy";

/** สถานะที่เพิ่มลงตะกร้ารับชำระเบี้ยได้ (REQ-4.1). */
export const CART_ELIGIBLE_STATUSES: ReadonlySet<PolicyStatus> = new Set<PolicyStatus>([
  "awaiting",
  "due_soon",
]);

/** กรมธรรม์เพิ่มลงตะกร้าได้หรือไม่ (REQ-4.1, 4.3, 4.6). */
export function isCartEligible(status: PolicyStatus): boolean {
  return CART_ELIGIBLE_STATUSES.has(status);
}

/** เบี้ยรวมของรายการในตะกร้า (REQ-5.4). */
export function sumPremium(items: readonly Policy[]): number {
  return items.reduce((acc, p) => acc + p.premium, 0);
}

/** หมวดประกันภัยระดับบน — รถยนต์ vs นอกเหนือรถยนต์ (REQ-3.2). */
export type PolicyCategory = "motor" | "non-motor";

/** จัดหมวดกรมธรรม์: ประกันรถยนต์ = motor, ที่เหลือ = non-motor. */
export function policyCategory(p: Policy): PolicyCategory {
  return p.product.type === "ประกันรถยนต์" ? "motor" : "non-motor";
}

export interface PolicyFilter {
  search: string;
  /** หมวด Motor/Non-Motor; "" = ไม่จำกัด */
  category: string;
  /** ชื่อ-นามสกุลผู้เอาประกัน (substring); "" = ไม่จำกัด */
  customerName: string;
  /** ช่วงวันที่เริ่มคุ้มครอง (effectiveDate) แบบ YYYY-MM-DD; ว่าง = ไม่จำกัด */
  startDate: string;
  endDate: string;
  status: PolicyStatus | "all";
}

/** Predicate รวม search + category + ชื่อ + ช่วงวันที่ + status แบบ AND (REQ-3.1–3.6). */
export function matchesPolicyFilter(p: Policy, f: PolicyFilter): boolean {
  if (f.status !== "all" && p.status !== f.status) return false;
  if (f.category && policyCategory(p) !== f.category) return false;
  if (f.customerName) {
    const n = f.customerName.trim().toLowerCase();
    if (!p.customer.name.toLowerCase().includes(n)) return false;
  }
  {
    // date input เป็น free text (ตามแบบ invoice/list) — ใช้กรองเฉพาะค่าที่เป็น YYYY-MM-DD เต็ม
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    const eff = p.effectiveDate.slice(0, 10); // ISO -> YYYY-MM-DD เทียบ lexicographic ได้
    if (ISO_DATE.test(f.startDate) && eff < f.startDate) return false;
    if (ISO_DATE.test(f.endDate) && eff > f.endDate) return false;
  }
  if (f.search) {
    const q = f.search.trim().toLowerCase();
    const hit =
      p.id.toLowerCase().includes(q) ||
      p.customer.name.toLowerCase().includes(q);
    if (!hit) return false;
  }
  return true;
}

/** ตัวเลือกหมวดประกันภัย (Motor/Non-Motor) — คงที่. */
export const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "motor", label: "Motor" },
  { value: "non-motor", label: "Non-Motor" },
];

/** ตัวเลือกสถานะการชำระเงิน (map จาก PolicyStatus) — เรียงตามลำดับงาน. */
export const PAYMENT_STATUS_OPTIONS: { value: PolicyStatus; label: string }[] = [
  { value: "awaiting", label: "ยังไม่ชำระ" },
  { value: "due_soon", label: "ใกล้ครบกำหนด" },
  { value: "active", label: "ชำระแล้ว" },
  { value: "lapsed", label: "ขาดอายุ" },
  { value: "cancelled", label: "ยกเลิก" },
];

const STATUS_ORDER: PolicyStatus[] = [
  "active",
  "due_soon",
  "awaiting",
  "lapsed",
  "cancelled",
];

/** จำนวนนับต่อสถานะ + "all" จากชุดข้อมูลเต็ม (REQ-2.2). */
export function countByStatus(
  list: readonly Policy[],
): Record<PolicyStatus | "all", number> {
  const counts = {
    all: list.length,
    active: 0,
    due_soon: 0,
    awaiting: 0,
    lapsed: 0,
    cancelled: 0,
  } as Record<PolicyStatus | "all", number>;
  for (const p of list) counts[p.status] += 1;
  return counts;
}

/** ตัวเลือกตัวกรองประเภท — derive จากข้อมูล (ไม่ hardcode ซ้ำ). */
export function buildTypeOptions(
  list: readonly Policy[],
): { value: string; label: string }[] {
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];
  for (const p of list) {
    if (!seen.has(p.product.type)) {
      seen.add(p.product.type);
      options.push({ value: p.product.type, label: p.product.type });
    }
  }
  return options.sort((a, b) => a.label.localeCompare(b.label, "th"));
}

/** ตัวเลือกตัวกรองที่มา — derive จากข้อมูล (value = code, label = code + channel). */
export function buildSourceOptions(
  list: readonly Policy[],
): { value: string; label: string }[] {
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];
  for (const p of list) {
    if (!seen.has(p.source.code)) {
      seen.add(p.source.code);
      options.push({ value: p.source.code, label: `${p.source.code} — ${p.source.channel}` });
    }
  }
  return options.sort((a, b) => a.value.localeCompare(b.value));
}

export { STATUS_ORDER };
