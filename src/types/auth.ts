/**
 * identity ที่ประกอบจาก GET /api/v1/me + GET /api/v1/me/access (employee stack ใหม่).
 * FE ไม่ถือ token — identity มาจาก httpOnly session cookie ที่ backend จัดการ (BFF).
 * คงชื่อ field adminId/permissions เพื่อไม่แตะ consumer; email ยังไม่มีใน /me.
 * stack ใหม่ไม่มี tier: hasPlatformAccess = มี platform role ACTIVE อย่างน้อยหนึ่ง (ไม่ได้แปลว่าเห็นทุก merchant);
 * merchant scope อยู่ที่ GET /api/v1/me/merchants + POST /api/v1/auth/merchant-context (ยังไม่ใช้ใน SPA).
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
