import type { Audience } from "@/types/auth";

/**
 * Config + ค่าคงที่ของ auth — อ่าน client_id จาก env เท่านั้น, ไม่ hardcode (REQ-6.1, 6.2).
 * แยกจาก pure logic เพื่อให้ session.ts คง node-testable.
 */

// อ้าง process.env แบบ static literal ต่อ audience -> ให้ Next inline ค่า NEXT_PUBLIC_* ตอน build
const CLIENT_ID_BY_AUDIENCE: Record<Audience, string | undefined> = {
  admin: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN,
  producer: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_PRODUCER,
};

/** client_id ของ audience จาก env; null = ไม่ตั้ง -> ปุ่ม disabled + config error (REQ-2.5, 6.1). */
export function getClientId(audience: Audience): string | null {
  const id = CLIENT_ID_BY_AUDIENCE[audience];
  return id && id.trim() ? id : null;
}

/**
 * landing route ต่อ audience (REQ-4.1).
 * ponytail: repo ยังไม่มี surface ฝั่ง producer -> ชั่วคราวทั้งคู่ "/main"; เปลี่ยนที่เดียวเมื่อมี (F8).
 */
export const LANDING_BY_AUDIENCE: Record<Audience, string> = {
  admin: "/main",
  producer: "/main",
};

/**
 * allowed hosted-domain ต่อ audience (REQ-3.8).
 * ponytail: default ว่าง = ปิด hd check; ใส่ domain เมื่อต้องจำกัดจริง.
 */
export const ALLOWED_HOSTED_DOMAINS: Record<Audience, string[]> = {
  admin: [],
  producer: [],
};
