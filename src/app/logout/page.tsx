"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { logout } from "@/lib/api/admin/auth";

// sign-out: เรียก BFF logout (POST /admin/auth/logout + CSRF) แล้วเด้งกลับ /login เมื่อได้ 204 เท่านั้น.
export default function LogoutPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const attemptLogout = useCallback(async () => {
    setFailed(false);
    try {
      await logout();
      router.replace("/login");
    } catch {
      setFailed(true);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void logout()
      .then(() => {
        if (!cancelled) router.replace("/login");
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (failed) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-grey-100 p-4">
        <p className="text-sm text-error" role="alert">
          ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง
        </p>
        <button
          type="button"
          onClick={() => void attemptLogout()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          ลองอีกครั้ง
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <p className="text-sm text-muted-foreground" role="status">
        กำลังออกจากระบบ...
      </p>
    </main>
  );
}
