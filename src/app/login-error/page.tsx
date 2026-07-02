import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Clock } from "lucide-react";

// backend redirect ปลายทางเมื่อ login callback ไม่ผ่าน (Admin/Producer OIDC ErrorPath="/login-error")
// พร้อม ?reason=<label>. label จาก {Admin,Producer}LoginService/{Admin,Producer}OidcAuthentication.DenyAsync.
const REASON_MESSAGES: Record<string, string> = {
  "not-provisioned": "บัญชี Google นี้ยังไม่ได้รับสิทธิ์ — ยังไม่ถูก provision เป็น admin. ติดต่อผู้ดูแลระบบ",
  suspended: "บัญชีถูกระงับการใช้งาน. ติดต่อผู้ดูแลระบบ",
  "access-denied": "การเข้าสู่ระบบถูกยกเลิก",
  "missing-subject": "ไม่พบข้อมูลบัญชีจาก Google",
  "resolve-failed": "ตรวจสอบสิทธิ์ไม่สำเร็จ กรุณาลองใหม่",
  "session-write-failed": "สร้าง session ไม่สำเร็จ กรุณาลองใหม่",
  // producer SSO callback (คู่มือ §6.2) — suspended/access-denied/resolve-failed/session-write-failed ใช้ร่วมด้านบน
  "email-unverified": "อีเมล Google ของคุณยังไม่ได้ยืนยัน กรุณายืนยันอีเมลแล้วลองใหม่",
  "hd-mismatch": "กรุณาใช้บัญชีอีเมลขององค์กรที่ได้รับอนุญาต",
  "auth-failed": "การยืนยันตัวตนล้มเหลว กรุณาลองใหม่",
  "ticket-issue-failed": "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่",
  "missing-identity": "ไม่พบข้อมูลบัญชีจาก Google",
  // FE-minted (จากหน้า /register เมื่อ submit ไม่ผ่าน terminal)
  "registration-link-invalid": "ลิงก์ลงทะเบียนไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
  "already-registered": "บัญชีนี้ลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบ",
};
const DEFAULT_MESSAGE = "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่";

// รอ admin อนุมัติ — ไม่ใช่ error จริง (ผู้ใช้ลงทะเบียนสำเร็จ) จึงแสดงหัวข้อ/ไอคอนคนละแบบจากเคส deny อื่นๆ
const PENDING_REASON = "awaiting-approval";
const PENDING_MESSAGE = "ระบบได้รับข้อมูลการลงทะเบียนของคุณแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ";

const linkButtonClass =
  "mt-8 inline-flex h-11 w-full items-center justify-center rounded-control bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

export const metadata: Metadata = { title: "เข้าสู่ระบบไม่สำเร็จ vCentral Pay" };

// Header bar — เหมือนหน้า /login (โลโก้วิริยะในกล่องขาว + tagline บนพื้นน้ำเงิน)
function LoginErrorHeader() {
  return (
    <header className="flex min-h-[60px] shrink-0 items-stretch gap-3 bg-crop-blue pr-4 sm:min-h-[70px] sm:gap-4 sm:pr-6">
      <span className="flex shrink-0 items-center bg-white px-3 sm:px-5">
        <Image
          src="/viriyah-logo.jpg"
          alt="วิริยะประกันภัย"
          width={180}
          height={64}
          priority
          className="h-9 w-auto sm:h-12"
        />
      </span>
      <span className="flex items-center text-xs italic text-white/90 sm:text-sm">
        ความเป็นธรรม คือ พื้นฐาน
      </span>
    </header>
  );
}

// Banner — responsive: scale ตาม aspect จริง (1280x300) ไม่ crop
function LoginErrorBanner() {
  return (
    <Image
      src="/v-central-pay-banner.jpg"
      alt="V Central Pay"
      width={1280}
      height={300}
      priority
      sizes="100vw"
      className="h-auto w-full shrink-0"
    />
  );
}

// shell-free (root layout only) -> public. backend เด้งมาที่นี่เมื่อ deny; อ่าน reason แสดงข้อความ.
export default async function LoginErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const reason = typeof params.reason === "string" ? params.reason : undefined;
  const isPending = reason === PENDING_REASON;
  const title = isPending ? "รอการอนุมัติ" : "เข้าสู่ระบบไม่สำเร็จ";
  const message = isPending ? PENDING_MESSAGE : (reason && REASON_MESSAGES[reason]) || DEFAULT_MESSAGE;

  return (
    <main className="flex min-h-dvh flex-col bg-grey-100">
      <LoginErrorHeader />
      <LoginErrorBanner />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-2xl bg-background px-6 py-10 text-center shadow-card">
          {isPending && (
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-warning/12">
              <Clock className="size-12 text-warning" strokeWidth={1.5} />
            </div>
          )}
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Link href="/login" className={linkButtonClass}>
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </main>
  );
}
