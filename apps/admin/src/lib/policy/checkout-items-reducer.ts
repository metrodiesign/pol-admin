// Pure reducer สำหรับรายการกรมธรรม์ในหน้า checkout — แยกจาก hook เพื่อ test ตรง ๆ.
// แถวมาจาก policy ที่เลือก: แก้ได้แค่ส่วนลด + ลบแถว (ไม่มีเพิ่มแถวเปล่า).

import type { CheckoutLineItem } from "@/lib/policy/checkout";

type EditableFields = Pick<CheckoutLineItem, "discount">;

export type CheckoutItemsAction =
  | { type: "remove"; uid: string }
  | { type: "update"; uid: string; patch: Partial<EditableFields> };

export function checkoutItemsReducer(
  items: CheckoutLineItem[],
  action: CheckoutItemsAction,
): CheckoutLineItem[] {
  switch (action.type) {
    case "remove":
      return items.filter((i) => i.uid !== action.uid);
    case "update":
      return items.map((i) =>
        i.uid === action.uid ? { ...i, ...action.patch } : i,
      );
    default:
      return items;
  }
}
