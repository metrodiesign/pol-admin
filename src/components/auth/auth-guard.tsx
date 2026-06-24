"use client";

import React, { useEffect } from "react";

import { login } from "@/lib/api/admin-api";
import { useAuth } from "./auth-provider";

/** loading placeholder — กัน flash ของ shell ก่อน /admin/me ตอบ. */
function AuthPending(): React.JSX.Element {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <p className="text-sm text-muted-foreground" role="status">
        กำลังตรวจสอบสถานะ...
      </p>
    </main>
  );
}

/** กันหน้าที่ต้อง login: anon -> เด้งไป SSO; loading -> placeholder; authed -> render children. */
export function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { status } = useAuth();

  useEffect(() => {
    if (status === "anon") login(window.location.pathname);
  }, [status]);

  if (status !== "authed") return <AuthPending />;
  return <>{children}</>;
}
