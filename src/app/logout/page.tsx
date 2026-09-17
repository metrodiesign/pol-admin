"use client";

import { useCallback, useEffect, useState } from "react";

import { EMPLOYEE_END_SESSION_URL, logout } from "@/lib/api/admin/auth";

// sign-out: เรียก BFF logout (step 1) แล้ว full navigation ไป Entra end_session_endpoint (step 2)
// เมื่อได้ 204 หรือ terminal logged-out state (401) — full navigation ให้ 302 ของ Entra ทำงานจริง ไม่ใช้ router.replace.
export default function LogoutPage() {
  const [failed, setFailed] = useState(false);
  const attemptLogout = useCallback(async () => {
    setFailed(false);
    try {
      await logout();
      window.location.href = EMPLOYEE_END_SESSION_URL;
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void logout()
      .then(() => {
        if (!cancelled) window.location.href = EMPLOYEE_END_SESSION_URL;
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-grey-100 p-4">
        <p className="text-base text-error" role="alert">
          ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง
        </p>
        <button
          type="button"
          onClick={() => void attemptLogout()}
          className="rounded-lg bg-primary px-4 py-2 text-base font-semibold text-white"
        >
          ลองอีกครั้ง
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <p className="text-base text-muted-foreground" role="status">
        กำลังออกจากระบบ...
      </p>
    </main>
  );
}
