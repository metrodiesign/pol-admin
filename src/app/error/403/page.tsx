import Link from "next/link";
import type { Metadata } from "next";
import { ErrorCard, errorButtonClass } from "@/components/error/error-screen";

export const metadata: Metadata = { title: "ไม่มีสิทธิ์เข้าถึง | POL Admin" };

// in-shell (MinimalsLayout จาก error/layout.tsx) — การ์ดกลางพื้นที่ content ไม่มี header วิริยะซ้ำ
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <ErrorCard
        code="403"
        title="ไม่มีสิทธิ์เข้าถึง"
        message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ ติดต่อผู้ดูแลระบบหากคิดว่าเป็นข้อผิดพลาด"
      >
        <Link href="/dashboard" className={errorButtonClass}>
          กลับหน้าหลัก
        </Link>
      </ErrorCard>
    </div>
  );
}
