/** ระดับสิทธิ์ของ admin จาก backend (GET /admin/me). */
export type AdminTier = "Super" | "Scoped";

/** merchant ที่ admin เข้าถึงได้ — backend ยังเป็น authorization source of truth. */
export interface AccessibleMerchants {
  isUnrestricted: boolean;
  merchants?: { id: string; code: string | null }[];
}

/**
 * payload ของ GET /admin/me (200). FE ไม่ถือ token — identity มาจาก httpOnly session cookie
 * ที่ backend จัดการ (server-side OIDC BFF). backend ยังไม่ส่ง name/picture (ดู coordination item).
 */
export interface AdminMe {
  adminId: string;
  email: string;
  tier: AdminTier;
  accessibleMerchants: AccessibleMerchants;
  permissions: string[];
}

export type AuthStatus = "loading" | "authed" | "anon" | "forbidden" | "error";

export type AuthBootstrapResult =
  | { status: "authed"; me: AdminMe }
  | { status: "anon" | "forbidden" | "error"; me: null };
