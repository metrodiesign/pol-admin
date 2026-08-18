// Pure cart reducer สำหรับตะกร้ารับชำระเบี้ย — แยกจาก hook เพื่อ test ตรง ๆ (ไม่ดึง React).

import type { Policy } from "@/types/policy";

export type CartAction =
  | { type: "add"; policy: Policy }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "replace"; items: Policy[] };

/** add/remove/clear/replace — กันซ้ำตาม id (ทุกสถานะเพิ่มได้ — REQ-4.6, 4.7). */
export function cartReducer(items: Policy[], action: CartAction): Policy[] {
  switch (action.type) {
    case "add":
      if (items.some((i) => i.id === action.policy.id)) return items;
      return [...items, action.policy];
    case "remove":
      return items.filter((i) => i.id !== action.id);
    case "clear":
      return [];
    case "replace":
      return action.items;
    default:
      return items;
  }
}
