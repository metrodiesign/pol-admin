import { describe, it, expect } from "vitest";
import type { Policy } from "@/types/policy";
import { cartReducer } from "@/lib/policy/cart";

// reducer อ่านแค่ .id — cast minimal object พอ
const p = (id: string) => ({ id }) as Policy;

describe("cartReducer", () => {
  it("add เพิ่มใบใหม่", () => {
    const next = cartReducer([], { type: "add", policy: p("A") });
    expect(next.map((i) => i.id)).toEqual(["A"]);
  });

  it("add ซ้ำ id เดิม = ไม่เพิ่ม (กันซ้ำ) + คืน reference เดิม", () => {
    const items = [p("A")];
    const next = cartReducer(items, { type: "add", policy: p("A") });
    expect(next).toBe(items);
    expect(next).toHaveLength(1);
  });

  it("add หลายใบต่างกัน เรียงตามที่เพิ่ม", () => {
    let s = cartReducer([], { type: "add", policy: p("A") });
    s = cartReducer(s, { type: "add", policy: p("B") });
    expect(s.map((i) => i.id)).toEqual(["A", "B"]);
  });

  it("remove เอาตาม id ออก", () => {
    const next = cartReducer([p("A"), p("B")], { type: "remove", id: "A" });
    expect(next.map((i) => i.id)).toEqual(["B"]);
  });

  it("remove id ที่ไม่มี = ไม่เปลี่ยนเนื้อหา", () => {
    const next = cartReducer([p("A")], { type: "remove", id: "X" });
    expect(next.map((i) => i.id)).toEqual(["A"]);
  });

  it("clear = ว่าง", () => {
    expect(cartReducer([p("A"), p("B")], { type: "clear" })).toEqual([]);
  });

  it("ไม่ mutate input (add คืน array ใหม่)", () => {
    const items = [p("A")];
    const next = cartReducer(items, { type: "add", policy: p("B") });
    expect(items).toHaveLength(1);
    expect(next).not.toBe(items);
  });
});
