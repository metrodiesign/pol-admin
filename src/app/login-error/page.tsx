import Link from "next/link";
import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";

// backend redirect ปลายทางเมื่อ login callback ไม่ผ่าน (AdminAuthOptions.ErrorPath="/login-error")
// พร้อม ?reason=<label>. label จาก AdminLoginService/AdminOidcAuthentication.DenyAsync.
const REASON_MESSAGES: Record<string, string> = {
  "not-provisioned": "บัญชี Google นี้ยังไม่ได้รับสิทธิ์ — ยังไม่ถูก provision เป็น admin. ติดต่อผู้ดูแลระบบ",
  suspended: "บัญชีถูกระงับการใช้งาน. ติดต่อผู้ดูแลระบบ",
  "access-denied": "การเข้าสู่ระบบถูกยกเลิก",
  "missing-subject": "ไม่พบข้อมูลบัญชีจาก Google",
  "resolve-failed": "ตรวจสอบสิทธิ์ไม่สำเร็จ กรุณาลองใหม่",
  "session-write-failed": "สร้าง session ไม่สำเร็จ กรุณาลองใหม่",
};
const DEFAULT_MESSAGE = "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่";

export const metadata: Metadata = { title: "เข้าสู่ระบบไม่สำเร็จ vCentral Pay" };

// shell-free (root layout only) -> public. backend เด้งมาที่นี่เมื่อ deny; อ่าน reason แสดงข้อความ.
export default async function LoginErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const reason = typeof params.reason === "string" ? params.reason : undefined;
  const message = (reason && REASON_MESSAGES[reason]) || DEFAULT_MESSAGE;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background px-6 py-10 text-center shadow-card">
        <h1 className="text-xl font-bold text-foreground">เข้าสู่ระบบไม่สำเร็จ</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Link href="/login" className={buttonVariants({ size: "lg", className: "mt-8 w-full" })}>
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </main>
  );
}
