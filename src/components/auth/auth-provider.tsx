"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { getMe } from "@/lib/api/admin-api";
import type { AdminMe } from "@/types/auth";

type AuthStatus = "loading" | "authed" | "anon";

interface AuthContextValue {
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
  accessibleTenants: { isUnrestricted: true },
};

/** identity ปัจจุบันจาก /admin/me. ต้องอยู่ใต้ <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

/** เช็ค session ครั้งเดียวตอน mount ผ่าน GET /admin/me (200 -> authed, 401 -> anon). */
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
    getMe()
      .then((me) => {
        if (active) {
          setState(me ? { me, status: "authed" } : { me: null, status: "anon" });
        }
      })
      .catch(() => {
        if (active) setState({ me: null, status: "anon" });
      });
    return () => {
      active = false;
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
