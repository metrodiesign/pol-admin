import type { Audience } from "@/types/auth";

/**
 * Config + ค่าคงที่ของ auth — อ่าน client_id จาก env เท่านั้น, ไม่ hardcode (REQ-6.1, 6.2).
 * แยกจาก pure logic เพื่อให้ session.ts คง node-testable.
 */

/**
 * client_id ของ audience จาก env; null = ไม่ตั้ง -> ปุ่ม disabled + config error (REQ-2.5, 6.1).
 * อ่าน process.env แบบ static literal ต่อ audience (Next inline NEXT_PUBLIC_*) และอ่าน ณ เวลาเรียก
 * เพื่อให้ test stub env ได้.
 */
export function getClientId(audience: Audience): string | null {
  const id =
    audience === "admin"
      ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_ADMIN
      : process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_PRODUCER;
  return id && id.trim() ? id : null;
}

/**
 * reverse: client_id (= `aud` ใน token) -> audience. ไม่ตรง client ที่ตั้งไว้ -> null.
 * ใช้ตอนโชว์ปุ่ม Google ทั้ง 2 audience พร้อมกัน (callback เดียว derive audience จาก aud) (REQ-3.4).
 */
export function audienceForClientId(clientId: string): Audience | null {
  if (!clientId) return null;
  if (clientId === getClientId("admin")) return "admin";
  if (clientId === getClientId("producer")) return "producer";
  return null;
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
