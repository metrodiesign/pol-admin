"use client";

import React, { useEffect } from "react";

import { ErrorCard, errorButtonClass } from "@/components/error/error-screen";
import { shouldRedirectToLogin, shouldShowForbidden } from "@/lib/api/admin/auth";
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

/** กันหน้าที่ต้อง login: anon -> เด้งไปหน้า /login (ผู้ใช้เลือก role แล้วเริ่ม SSO เอง);
    loading -> placeholder; authed -> render children. */
export function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { me, status } = useAuth();

  useEffect(() => {
    if (shouldRedirectToLogin(status)) window.location.href = "/login";
  }, [status]);

  if (shouldShowForbidden(status, me)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
        <ErrorCard
          code="403"
          title="ไม่มีสิทธิ์เข้าถึง"
          message="บัญชีนี้ไม่มีสิทธิ์เปิดระบบผู้ดูแล ติดต่อผู้ดูแลระบบหากคิดว่าเป็นข้อผิดพลาด"
        />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
        <ErrorCard
          title="ตรวจสอบสถานะไม่สำเร็จ"
          message="ระบบขัดข้องชั่วคราว กรุณาโหลดหน้าใหม่"
        >
          <button
            type="button"
            className={errorButtonClass}
            onClick={() => window.location.reload()}
          >
            โหลดหน้าใหม่
          </button>
        </ErrorCard>
      </main>
    );
  }

  if (status !== "authed") return <AuthPending />;
  return <>{children}</>;
}
