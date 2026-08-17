import { describe, it, expect } from "vitest";
import type { Policy, PolicyStatus } from "@/types/policy";
import {
  isCartEligible,
  sumPremium,
  policyCategory,
  matchesPolicyFilter,
  countByStatus,
  type PolicyFilter,
} from "@/lib/policy/policy";

/** สร้าง Policy ครบ field สำหรับ test — override เฉพาะที่สนใจ. */
function makePolicy(overrides: Partial<Policy> = {}): Policy {
  return {
    id: "POL-0000001",
    effectiveDate: "2026-01-15",
    coverageEnd: "2027-01-15",
    customer: { name: "สมชาย ใจดี", phone: "0800000000" },
    product: { type: "ประกันรถยนต์", plan: "ชั้น 1" },
    source: { code: "KKC", channel: "สาขากรุงเทพ" },
    insuranceKind: "VMI",
    referenceType: "policy",
    referenceNo: "06303-69100/รย/000001",
    extraInfo: { text: "1กก 1234" },
    sumInsured: 500000,
    premium: 1000,
    netPremium: 700,
    totalAmount: 1000,
    frequency: "yearly",
    nextDue: { date: "2026-02-15", installmentNo: 1 },
    deduction: { state: "none" },
    vcp: "none",
    status: "active",
    ...overrides,
  };
}

const EMPTY_FILTER: PolicyFilter = {
  search: "",
  category: "",
  customerName: "",
  startDate: "",
  endDate: "",
  status: "all",
};

describe("isCartEligible", () => {
  it("awaiting + due_soon = eligible", () => {
    expect(isCartEligible("awaiting")).toBe(true);
    expect(isCartEligible("due_soon")).toBe(true);
  });
  it("active/lapsed/cancelled = not eligible", () => {
    expect(isCartEligible("active")).toBe(false);
    expect(isCartEligible("lapsed")).toBe(false);
    expect(isCartEligible("cancelled")).toBe(false);
  });
});

describe("sumPremium", () => {
  it("ว่าง = 0", () => {
    expect(sumPremium([])).toBe(0);
  });
  it("รวม premium ทุกใบ (ไม่ใช่ totalAmount/netPremium)", () => {
    const items = [
      makePolicy({ id: "a", premium: 1000 }),
      makePolicy({ id: "b", premium: 2500.5 }),
    ];
    expect(sumPremium(items)).toBe(3500.5);
  });
});

describe("policyCategory", () => {
  it("ประกันรถยนต์ = motor", () => {
    expect(policyCategory(makePolicy({ product: { type: "ประกันรถยนต์" } }))).toBe("motor");
  });
  it("อื่น ๆ = non-motor", () => {
    expect(policyCategory(makePolicy({ product: { type: "ประกันสุขภาพ" } }))).toBe("non-motor");
  });
});

describe("matchesPolicyFilter", () => {
  it("filter ว่าง = match ทุกใบ", () => {
    expect(matchesPolicyFilter(makePolicy(), EMPTY_FILTER)).toBe(true);
  });

  it("status กรองตรงตัว, 'all' ไม่กรอง", () => {
    const p = makePolicy({ status: "awaiting" });
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, status: "awaiting" })).toBe(true);
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, status: "active" })).toBe(false);
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, status: "all" })).toBe(true);
  });

  it("category motor/non-motor", () => {
    const car = makePolicy({ product: { type: "ประกันรถยนต์" } });
    expect(matchesPolicyFilter(car, { ...EMPTY_FILTER, category: "motor" })).toBe(true);
    expect(matchesPolicyFilter(car, { ...EMPTY_FILTER, category: "non-motor" })).toBe(false);
  });

  it("customerName = substring, case-insensitive", () => {
    const p = makePolicy({ customer: { name: "สมหญิง รักดี", phone: "0811111111" } });
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, customerName: "รักดี" })).toBe(true);
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, customerName: "ไม่มี" })).toBe(false);
  });

  it("search match id หรือชื่อ (case-insensitive)", () => {
    const p = makePolicy({ id: "POL-2402062", customer: { name: "Alice", phone: "0" } });
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, search: "2402062" })).toBe(true);
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, search: "alice" })).toBe(true);
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, search: "zzz" })).toBe(false);
  });

  it("date range กรองด้วย effectiveDate เฉพาะค่า YYYY-MM-DD เต็ม", () => {
    const p = makePolicy({ effectiveDate: "2026-06-15" });
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, startDate: "2026-06-01" })).toBe(true);
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, startDate: "2026-07-01" })).toBe(false);
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, endDate: "2026-06-30" })).toBe(true);
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, endDate: "2026-05-31" })).toBe(false);
    // free-text ไม่เต็มรูป = ไม่ใช้กรอง
    expect(matchesPolicyFilter(p, { ...EMPTY_FILTER, startDate: "2026-06" })).toBe(true);
  });

  it("AND: ทุกเงื่อนไขต้องผ่านพร้อมกัน", () => {
    const p = makePolicy({
      id: "POL-1",
      status: "awaiting",
      product: { type: "ประกันรถยนต์" },
      customer: { name: "บุญมี", phone: "0" },
    });
    expect(
      matchesPolicyFilter(p, {
        ...EMPTY_FILTER,
        status: "awaiting",
        category: "motor",
        customerName: "บุญมี",
      }),
    ).toBe(true);
    // เปลี่ยน category ให้ไม่ตรง -> ตก
    expect(
      matchesPolicyFilter(p, {
        ...EMPTY_FILTER,
        status: "awaiting",
        category: "non-motor",
        customerName: "บุญมี",
      }),
    ).toBe(false);
  });
});

describe("countByStatus", () => {
  it("นับต่อสถานะ + all = ทั้งหมด", () => {
    const list: Policy[] = [
      makePolicy({ id: "1", status: "active" }),
      makePolicy({ id: "2", status: "active" }),
      makePolicy({ id: "3", status: "awaiting" }),
      makePolicy({ id: "4", status: "cancelled" }),
    ];
    const c = countByStatus(list);
    expect(c.all).toBe(4);
    expect(c.active).toBe(2);
    expect(c.awaiting).toBe(1);
    expect(c.cancelled).toBe(1);
    expect(c.due_soon).toBe(0);
    expect(c.lapsed).toBe(0);
  });

  it("ลิสต์ว่าง = ทุกค่า 0", () => {
    const c = countByStatus([]);
    const keys: (PolicyStatus | "all")[] = [
      "all",
      "active",
      "due_soon",
      "awaiting",
      "lapsed",
      "cancelled",
    ];
    for (const k of keys) expect(c[k]).toBe(0);
  });
});
