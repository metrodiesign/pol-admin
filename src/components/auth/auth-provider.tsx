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
  const [state, setState] = useState<AuthContextValue>({
    me: null,
    status: "loading",
  });

  useEffect(() => {
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
