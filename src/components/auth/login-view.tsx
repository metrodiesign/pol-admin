"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { login, microsoftLogin } from "@/lib/api/admin-api";
import { producerLogin, producerMicrosoftLogin } from "@/lib/api/producer-api";

// landing หลัง login = /main (admin landing จริง). backend ต้องมี /main ใน AdminSession:ReturnUrlAllowlist
// (ไม่งั้น reject -> falls back /). ดู coordination item ใน spec.
const RETURN_TO = "/main";

// โลโก้ Google สี (เลียนแบบปุ่ม GIS official ของเวอร์ชันเก่า)
function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden className="size-[18px]">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

// โลโก้ Microsoft (4 สี่เหลี่ยมมาตรฐาน)
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" aria-hidden className="size-[18px]">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

// ปุ่ม SSO พื้นขาว ตัดกับการ์ดน้ำเงิน (เลียนแบบปุ่ม Sign In ขาวใน mockup)
const SSO_BUTTON_CLASS =
  "h-12 w-full justify-center gap-2 bg-white text-crop-blue hover:bg-white/90 hover:text-crop-blue";

// server-side OIDC BFF: login = full-page navigate ไป backend แล้วกลับมาที่ returnTo (ไม่ใช่ fetch).
export function LoginView() {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      {/* 1. Header bar — โลโก้วิริยะ (พื้นน้ำเงิน → วางในกล่องขาวให้โลโก้น้ำเงินเห็นชัด) + tagline */}
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

      {/* 2. Banner — responsive: scale ตาม aspect จริง (1280x300) ไม่ crop */}
      <Image
        src="/v-central-pay-banner.jpg"
        alt="V Central Pay"
        width={1280}
        height={300}
        priority
        sizes="100vw"
        className="h-auto w-full shrink-0"
      />

      {/* 3. การ์ด login 2 ใบ (พนักงาน / ตัวแทน) วางกลางพื้นขาว */}
      <div className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
          <section
            aria-label="สำหรับพนักงาน"
            className="flex min-h-[260px] flex-col justify-center rounded-2xl bg-crop-blue p-8 shadow-card"
          >
            <h2 className="text-center text-lg font-semibold text-white">สำหรับพนักงาน</h2>
            <Button
              type="button"
              size="lg"
              className={`mt-8 ${SSO_BUTTON_CLASS}`}
              onClick={() => login(RETURN_TO)}
            >
              <GoogleIcon />
              เข้าสู่ระบบด้วย Google
            </Button>
            <Button
              type="button"
              size="lg"
              className={`mt-3 ${SSO_BUTTON_CLASS}`}
              onClick={() => microsoftLogin(RETURN_TO)}
            >
              <MicrosoftIcon />
              เข้าสู่ระบบด้วย Microsoft
            </Button>
          </section>

          <section
            aria-label="สำหรับตัวแทน/นายหน้า"
            className="flex min-h-[260px] flex-col justify-center rounded-2xl bg-crop-blue p-8 shadow-card"
          >
            <h2 className="text-center text-lg font-semibold text-white">สำหรับตัวแทน/นายหน้า</h2>
            <Button
              type="button"
              size="lg"
              className={`mt-8 ${SSO_BUTTON_CLASS}`}
              onClick={() => producerLogin()}
            >
              <GoogleIcon />
              เข้าสู่ระบบด้วย Google
            </Button>
            <Button
              type="button"
              size="lg"
              className={`mt-3 ${SSO_BUTTON_CLASS}`}
              onClick={() => producerMicrosoftLogin()}
            >
              <MicrosoftIcon />
              เข้าสู่ระบบด้วย Microsoft
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
}
