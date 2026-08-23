"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { getMe } from "@/lib/api/admin/auth";
import type { AdminMe, AuthStatus } from "@/types/auth";

export interface AuthContextValue {
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

/** เช็ค sessionครั้งเดียวตอน mount โดยคง auth/bootstrap failureเป็นคนละสถานะ. */
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [state, setState] = useState<AuthContextValue>({ me: null, status: "loading" });

  useEffect(() => {
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
