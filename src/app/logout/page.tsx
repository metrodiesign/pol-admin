"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { logout } from "@/lib/api/admin/auth";

// sign-out: เรียก BFF logout (POST /admin/auth/logout + CSRF) แล้วเด้งกลับ /login.
// .finally -> logout fail ก็ยังกลับ /login (guard จะเด้งไป SSO ต่อถ้า session ยังอยู่).
export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    logout().finally(() => router.replace("/login"));
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <p className="text-sm text-muted-foreground" role="status">
        กำลังออกจากระบบ...
      </p>
    </main>
  );
}
