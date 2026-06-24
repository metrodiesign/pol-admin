"use client";

import { Button } from "@/components/ui/button";
import { login } from "@/lib/api/admin-api";

// landing หลัง login = /main (admin landing จริง). backend ต้องมี /main ใน AdminSession:ReturnUrlAllowlist
// (ไม่งั้น reject -> falls back /). ดู coordination item ใน spec.
const RETURN_TO = "/main";

// server-side OIDC BFF: login = full-page navigate ไป backend แล้วกลับมาที่ returnTo (ไม่ใช่ fetch).
export function LoginView() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background px-6 py-10 text-center shadow-card">
        <h1 className="text-xl font-bold text-foreground">เข้าสู่ระบบ vCentral Pay</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เข้าสู่ระบบสำหรับพนักงานด้วยบัญชี Google
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-8 w-full"
          onClick={() => login(RETURN_TO)}
        >
          เข้าสู่ระบบด้วย Google
        </Button>
      </div>
    </main>
  );
}
