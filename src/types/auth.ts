/** ระดับสิทธิ์ของ admin จาก backend (GET /admin/me). */
export type AdminTier = "Super" | "Scoped";

/** tenant ที่ admin เข้าถึงได้ — Super = unrestricted; Scoped = รายการ tenant ที่ถูก assign. */
export interface AccessibleTenants {
  isUnrestricted: boolean;
  tenants?: { id: string; code: string }[];
}

/**
 * payload ของ GET /admin/me (200). FE ไม่ถือ token — identity มาจาก httpOnly session cookie
 * ที่ backend จัดการ (server-side OIDC BFF). backend ยังไม่ส่ง name/picture (ดู coordination item).
 */
export interface AdminMe {
  adminId: string;
  email: string;
  tier: AdminTier;
  accessibleTenants: AccessibleTenants;
}
