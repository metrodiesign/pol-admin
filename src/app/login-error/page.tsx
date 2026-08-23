import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Clock } from "lucide-react";

import { getLoginErrorContent } from "@/lib/auth/login-error";

const linkButtonClass =
  "mt-8 inline-flex h-11 w-full items-center justify-center rounded-control bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

export const metadata: Metadata = { title: "เข้าสู่ระบบไม่สำเร็จ POL Pay" };

// Header bar — เหมือนหน้า /login (โลโก้วิริยะในกล่องขาว + tagline บนพื้นน้ำเงิน)
function LoginErrorHeader() {
  return (
    <header className="flex min-h-[60px] shrink-0 items-stretch gap-3 bg-crop-blue pr-4 sm:min-h-[70px] sm:gap-4 sm:pr-6">
      <span className="flex shrink-0 items-center bg-white px-3 sm:px-5">
        <Image
          src="/viriyah-logo.png"
          alt="วิริยะประกันภัย"
          width={667}
          height={250}
          priority
          className="h-12 w-auto sm:h-16"
        />
      </span>
      <span className="flex items-center">
        <Image
          src="/fairness-tagline-white.png"
          alt="ความเป็นธรรม คือ พื้นฐาน"
          width={1147}
          height={176}
          className="h-6 w-auto sm:h-8"
        />
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
  const { title, message, isPending } = getLoginErrorContent(reason);

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
