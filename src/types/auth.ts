/**
 * identity ที่ประกอบจาก GET /api/v1/me + GET /api/v1/me/access (employee stack ใหม่).
 * SPA ถือ access/refresh token (OAuth code + PKCE) ใน localStorage (แชร์ทุกแท็บ) แล้วส่ง Bearer ทุก request.
 * คงชื่อ field adminId/permissions เพื่อไม่แตะ consumer.
 * stack ใหม่ไม่มี tier: hasPlatformAccess = มี platform role ACTIVE อย่างน้อยหนึ่ง (ไม่ได้แปลว่าเห็นทุก merchant);
 * merchant scope เลือกผ่าน refresh พร้อม merchant_id (ยังไม่ใช้ใน SPA).
 */
export interface AdminMe {
  adminId: string;
  displayName: string | null;
  email: string | null;
  hasPlatformAccess: boolean;
  permissions: string[];
}

export type AuthStatus = "loading" | "authed" | "anon" | "forbidden" | "error";

export type AuthBootstrapResult =
  | { status: "authed"; me: AdminMe }
  | { status: "anon" | "forbidden" | "error"; me: null };
