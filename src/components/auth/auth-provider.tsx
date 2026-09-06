"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { getMe } from "@/lib/api/admin/auth";
import type { AdminMe, AuthStatus } from "@/types/auth";

export interface AuthContextValue {
  me: AdminMe | null;
  status: AuthStatus;
  clearAuthState: () => void;
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
  const [state, setState] = useState<Omit<AuthContextValue, "clearAuthState">>({
    me: null,
    status: "loading",
  });
  const bootstrapVersion = useRef(0);

  const clearAuthState = useCallback(() => {
    bootstrapVersion.current += 1;
    setState({ me: null, status: "anon" });
  }, []);

  useEffect(() => {
    let active = true;
    const version = bootstrapVersion.current;
    getMe().then((result) => {
      if (active && version === bootstrapVersion.current) setState(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, clearAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}
