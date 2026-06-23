"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearSession } from "@/lib/auth/session-storage";

// sign-out: ล้าง mock session แล้วเด้งกลับ /login (REQ-8.1, 8.2, 8.3)
export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    clearSession();
    router.replace("/login");
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <p className="text-sm text-muted-foreground" role="status">
        กำลังออกจากระบบ...
      </p>
    </main>
  );
}
