"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { getMe, SKIP_AUTH, BYPASS_ME } from "@/lib/api/admin/auth";
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
  // TEMP bypass: ระหว่างรอ pol-core ปรับ /admin/me — เริ่มด้วย identity สังเคราะห์
  // เป็น authed เลย ไม่เรียก getMe (ดู SKIP_AUTH ใน lib/api/admin/auth.ts). ลบทั้ง branch เมื่อ pol-core พร้อม.
  const [state, setState] = useState<Omit<AuthContextValue, "clearAuthState">>(
    SKIP_AUTH ? { me: BYPASS_ME, status: "authed" } : { me: null, status: "loading" },
  );
  const bootstrapVersion = useRef(0);

  const clearAuthState = useCallback(() => {
    bootstrapVersion.current += 1;
    setState({ me: null, status: "anon" });
  }, []);

  useEffect(() => {
    if (SKIP_AUTH) return; // bypass: ไม่ bootstrap จาก /admin/me
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
