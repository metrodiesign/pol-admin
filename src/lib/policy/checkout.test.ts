import { describe, it, expect } from "vitest";
import type { Policy } from "@/types/policy";
import {
  parseIdsParam,
  pickPoliciesByIds,
  buildLineItem,
  buildCustomerInfo,
  lineItemDiscountPct,
  lineItemAmountDue,
  lineItemsTotal,
  estimateFee,
  expiryDescription,
  isCustomerValid,
  canIssue,
  type CheckoutLineItem,
  type CustomerInfo,
} from "@/lib/policy/checkout";
import { checkoutItemsReducer } from "@/lib/policy/checkout-items-reducer";

// pick อ่านแค่ .id — cast minimal object พอ
const p = (id: string) => ({ id }) as Policy;

const item = (overrides: Partial<CheckoutLineItem> = {}): CheckoutLineItem => ({
  uid: "POL-A",
  policyNo: "06303-69100/รย/023880",
  payerName: "นายสมชาย ใจดี",
  netPremium: 10000,
  grossPremium: 15000,
  discount: 0,
  reference: "กข 001",
  ...overrides,
});

describe("parseIdsParam", () => {
  it("undefined = ว่าง", () => {
    expect(parseIdsParam(undefined)).toEqual([]);
  });

  it("แตกตาม comma + trim + ตัดว่าง", () => {
    expect(parseIdsParam("POL-1, POL-2 ,,POL-3,")).toEqual(["POL-1", "POL-2", "POL-3"]);
  });
});

describe("pickPoliciesByIds", () => {
  const list = [p("A"), p("B"), p("C")];

  it("คงลำดับตาม ids, ตัด unknown, กันซ้ำ", () => {
    expect(pickPoliciesByIds(list, ["C", "Z", "A", "A"]).map((x) => x.id)).toEqual(["C", "A"]);
  });
});

describe("buildLineItem", () => {
  it("map policy -> แถว (referenceNo, ชื่อ, net/gross, ส่วนลด 0, อ้างอิง)", () => {
    const policy = {
      id: "POL-2401170",
      referenceNo: "06303-69100/รย/023880",
      customer: { name: "นายสมชาย ใจดี" },
      netPremium: 10162.03,
      totalAmount: 14517.18,
      extraInfo: { text: "กข 1001" },
    } as Policy;
    expect(buildLineItem(policy)).toEqual({
      uid: "POL-2401170",
      policyNo: "06303-69100/รย/023880",
      payerName: "นายสมชาย ใจดี",
      netPremium: 10162.03,
      grossPremium: 14517.18,
      discount: 0,
      reference: "กข 1001",
    });
  });
});

describe("lineItemDiscountPct", () => {
  it("ปัดเป็นจำนวนเต็ม (1000/10000=10%)", () => {
    expect(lineItemDiscountPct(item({ discount: 1000 }))).toBe(10);
  });

  it("1000/18000 -> 6% (ปัด)", () => {
    expect(lineItemDiscountPct(item({ netPremium: 18000, discount: 1000 }))).toBe(6);
  });

  it("netPremium 0 = 0%", () => {
    expect(lineItemDiscountPct(item({ netPremium: 0, discount: 100 }))).toBe(0);
  });
});

describe("lineItemAmountDue", () => {
  it("เบี้ยรวม − ส่วนลด (15000-1000=14000)", () => {
    expect(lineItemAmountDue(item({ discount: 1000 }))).toBe(14000);
  });
});

describe("lineItemsTotal + estimateFee", () => {
  it("รวมยอดชำระทุกแถว", () => {
    const items = [
      item({ uid: "A", grossPremium: 15000, discount: 1000 }), // 14000
      item({ uid: "B", grossPremium: 20000, discount: 1000 }), // 19000
    ];
    expect(lineItemsTotal(items)).toBe(33000);
  });

  it("ค่าธรรมเนียม = 2.5%", () => {
    expect(estimateFee(28260)).toBe(706.5);
  });
});

describe("expiryDescription", () => {
  it("ชั่วโมง vs วัน", () => {
    expect(expiryDescription("72h")).toBe("ลิงก์มีอายุ 72 ชั่วโมง");
    expect(expiryDescription("7d")).toBe("ลิงก์มีอายุ 7 วัน");
  });
});

describe("buildCustomerInfo", () => {
  it("prefill จาก customer; email/nationalId ว่างถ้าไม่มี", () => {
    const policy = { customer: { name: "สมชาย", phone: "081-000-0000" } } as Policy;
    expect(buildCustomerInfo(policy)).toEqual({
      name: "สมชาย",
      nationalId: "",
      email: "",
      phone: "081-000-0000",
    });
  });

  it("undefined policy = ค่าว่างทั้งหมด", () => {
    expect(buildCustomerInfo(undefined)).toEqual({ name: "", nationalId: "", email: "", phone: "" });
  });
});

describe("isCustomerValid", () => {
  const valid: CustomerInfo = {
    name: "สมชาย ใจดี",
    nationalId: "1-1018-00942-21-3",
    email: "somchai@example.com",
    phone: "0812345678",
  };

  it("ครบ + อีเมลถูก = valid (nationalId/email ไม่บังคับ)", () => {
    expect(isCustomerValid(valid)).toBe(true);
    expect(isCustomerValid({ ...valid, nationalId: "" })).toBe(true);
    expect(isCustomerValid({ ...valid, email: "" })).toBe(true);
    expect(isCustomerValid({ ...valid, email: "  " })).toBe(true);
  });

  it("ชื่อว่าง / เบอร์ว่าง / อีเมลผิด = invalid", () => {
    expect(isCustomerValid({ ...valid, name: "  " })).toBe(false);
    expect(isCustomerValid({ ...valid, phone: "" })).toBe(false);
    expect(isCustomerValid({ ...valid, email: "nope" })).toBe(false);
  });
});

describe("canIssue", () => {
  const customer: CustomerInfo = { name: "ก", nationalId: "", email: "a@b.co", phone: "1" };

  it("ลูกค้าครบ + มีรายการ + ส่วนลดถูก = true", () => {
    expect(canIssue({ customer, items: [item({ discount: 1000 })] })).toBe(true);
  });

  it("ไม่มีรายการ = false", () => {
    expect(canIssue({ customer, items: [] })).toBe(false);
  });

  it("ส่วนลดเกินเบี้ยรวม = false", () => {
    expect(canIssue({ customer, items: [item({ grossPremium: 1000, discount: 2000 })] })).toBe(false);
  });

  it("ส่วนลด = เบี้ยรวมพอดี (ยอดรวม 0) = false", () => {
    expect(canIssue({ customer, items: [item({ grossPremium: 1000, discount: 1000 })] })).toBe(false);
  });

  it("ลูกค้าไม่ครบ = false", () => {
    expect(canIssue({ customer: { ...customer, email: "x" }, items: [item({ discount: 1000 })] })).toBe(false);
  });
});

describe("checkoutItemsReducer", () => {
  it("remove ตาม uid", () => {
    const next = checkoutItemsReducer([item({ uid: "A" }), item({ uid: "B" })], { type: "remove", uid: "A" });
    expect(next.map((i) => i.uid)).toEqual(["B"]);
  });

  it("update patch ส่วนลดเฉพาะแถวที่ตรง uid", () => {
    const next = checkoutItemsReducer([item({ uid: "A" }), item({ uid: "B" })], {
      type: "update",
      uid: "B",
      patch: { discount: 500 },
    });
    expect(next.find((i) => i.uid === "B")?.discount).toBe(500);
    expect(next.find((i) => i.uid === "A")?.discount).toBe(0);
  });

  it("ไม่ mutate input", () => {
    const items = [item({ uid: "A" })];
    checkoutItemsReducer(items, { type: "update", uid: "A", patch: { discount: 9 } });
    expect(items[0]?.discount).toBe(0);
  });
});
