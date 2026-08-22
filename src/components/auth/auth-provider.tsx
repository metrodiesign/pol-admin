"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { getMe } from "@/lib/api/admin/auth";
import type { AdminMe, AuthStatus } from "@/types/auth";

export interface AuthContextValue {
  me: AdminMe | null;
  status: AuthStatus;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ponytail: dev bypass ระหว่างรอ /login (login-google-sso ยังไม่ implement) — ต้องเข้าทั้ง 2 เงื่อนไข
// กันหลุด prod แม้ env var รั่ว: NODE_ENV!=='production' + NEXT_PUBLIC_SKIP_AUTH==='true'. ลบทิ้งเมื่อ login เสร็จ.
const SKIP_AUTH =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

const MOCK_ME: AdminMe = {
  adminId: "dev-bypass",
  email: "dev@localhost",
  tier: "Super",
  accessibleMerchants: { isUnrestricted: true },
  permissions: ["settings.manage", "merchant.manage", "merchant.view"],
};

/** identity ปัจจุบันจาก /admin/me. ต้องอยู่ใต้ <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

/** เช็ค sessionครั้งเดียวตอน mount โดยคง auth/bootstrap failureเป็นคนละสถานะ. */
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [state, setState] = useState<AuthContextValue>(() =>
    SKIP_AUTH ? { me: MOCK_ME, status: "authed" } : { me: null, status: "loading" },
  );

  useEffect(() => {
    if (SKIP_AUTH) return;
    let active = true;
    getMe().then((result) => {
      if (active) setState(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
