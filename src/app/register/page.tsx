"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { Fieldset, Field, Label, Description } from "@/components/shared/fieldset";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";
import { Logo } from "@/components/layout/logo";
import { buildRegisterFormData, producerRegister } from "@/lib/api/producer-api";
import type { ProducerFormData } from "@/types/producer";

// ponytail: shell-free public page — no layout.tsx in this folder, inherits only root
// layout (mirror /login, REQ-11.2). Single client file; metadata title skipped (mock).

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

const emptyForm: ProducerFormData = {
  firstName: "",
  lastName: "",
  personType: "individual",
  idNumber: "",
  producerCode: "",
  licenseNumber: "",
  phoneNumber: "",
  email: "",
  acceptTerms: false,
};

const linkButtonClass =
  "mt-8 inline-flex h-11 min-w-[160px] items-center justify-center rounded-control bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

// Header bar — เหมือนหน้า /login (โลโก้วิริยะในกล่องขาว + tagline บนพื้นน้ำเงิน)
function RegisterHeader() {
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
function RegisterBanner() {
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

// branded splash — render เป็น overlay ระหว่าง submit (ฟอร์มยัง mount อยู่ข้างล่าง → error transient
// แล้วข้อมูลไม่หาย). fixed inset-0 คลุมทั้งจอ + กัน interaction.
function SubmitOverlay() {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white">
      <div className="relative inline-flex items-center justify-center" style={{ width: 120, height: 120 }}>
        <span
          className="relative z-[9] inline-flex"
          style={{ animation: "splash-logo-pulse 3s ease-in-out infinite" }}
        >
          <Logo size={64} idPrefix="register-loading" />
        </span>
        <span
          className="absolute"
          style={{
            width: "calc(100% - 20px)",
            height: "calc(100% - 20px)",
            border: "solid 3px color-mix(in srgb, var(--color-primary-dark) 24%, transparent)",
            animation: "splash-inner-ring 3.2s linear infinite",
          }}
        />
        <span
          className="absolute inset-0"
          style={{
            border: "solid 8px color-mix(in srgb, var(--color-primary-dark) 24%, transparent)",
            animation: "splash-outer-ring 3.2s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

function RegisterInner() {
  const ticket = useSearchParams().get("ticket");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const handleSave = useCallback(
    async (data: ProducerFormData) => {
      // identity มาจาก ticket เท่านั้น — ไม่มี ticket = ลิงก์ไม่ถูกต้อง/หมดอายุ (terminal)
      if (!ticket) {
        window.location.href = "/login-error?reason=registration-link-invalid";
        return;
      }
      setSubmitError(undefined);
      setSubmitting(true);
      try {
        const res = await producerRegister(buildRegisterFormData(data, ticket, photo));
        if (res.status === 201) {
          setSubmitted(true);
          return;
        }
        if (res.status === 409) {
          window.location.href = "/login-error?reason=already-registered";
          return;
        }
        if (res.status === 413) {
          setSubmitting(false);
          setPhotoError("รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 2MB)");
          return;
        }
        if (res.status === 429) {
          setSubmitting(false);
          setSubmitError("มีคำขอมากเกินไป กรุณาลองใหม่ภายหลัง");
          return;
        }
        if (res.status === 400) {
          // ProblemDetails: ข้อความ ticket อยู่ใน `title`, photo อยู่ใน `title`/`detail` — เช็คทั้งคู่
          const body = await res.json().catch(() => null);
          const msg = `${body?.title ?? ""} ${body?.detail ?? ""}`.toLowerCase();
          if (msg.includes("ticket")) {
            window.location.href = "/login-error?reason=registration-link-invalid";
            return;
          }
          setSubmitting(false);
          setPhotoError("รูปภาพไม่ถูกต้อง (รองรับ jpg/png/webp)");
          return;
        }
        setSubmitting(false);
        setSubmitError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      } catch {
        setSubmitting(false);
        setSubmitError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    },
    [ticket, photo],
  );

  if (submitted) {
    return (
      <main className="flex min-h-dvh flex-col bg-grey-100">
        <RegisterHeader />
        <RegisterBanner />
        <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-card bg-card px-6 py-12 text-center"
          style={cardStyle}
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/12">
            <CircleCheck className="size-12 text-success" strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 text-xl font-bold text-foreground">
            ลงทะเบียนสำเร็จ
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            ระบบได้รับข้อมูลการลงทะเบียนของคุณแล้ว
            <br />
            กรุณารอการอนุมัติจากผู้ดูแลระบบ
          </p>
          <Link href="/login" className={linkButtonClass}>
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-grey-100">
      <RegisterHeader />
      <RegisterBanner />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-xl font-bold text-foreground">การลงทะเบียนตัวแทน</h1>

        {submitError && (
          <div className="mb-6 rounded-control border border-error/24 bg-error/8 px-4 py-3 text-sm text-error">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
          <div className="mmd:col-span-4">
            <div
              className="rounded-card bg-card px-6 pb-10 pt-20"
              style={cardStyle}
            >
              <AvatarUpload
                size={144}
                error={Boolean(photoError)}
                onFileSelect={(file) => {
                  setPhoto(file);
                  setPhotoError(undefined);
                }}
              />
              {photoError && (
                <p className="mt-3 text-center text-xs text-error">{photoError}</p>
              )}

              <Fieldset aria-label="รูปถ่ายตัวแทน" className="mt-10">
                <Field className="flex-row items-start justify-between gap-4">
                  <div>
                    <Label className="text-sm font-semibold">
                      รูปถ่ายตัวแทน + บัตรประชาชน{" "}
                      <span className="text-error">*</span>
                    </Label>
                    <Description>
                      แนบรูปถ่ายตัวแทนพร้อมกับบัตรประชาชนผ่านปุ่มอัปโหลดด้านบน
                    </Description>
                  </div>
                </Field>
              </Fieldset>
            </div>
          </div>

          <div className="mmd:col-span-8">
            <ProducerEditFormCard
              initialData={emptyForm}
              submitLabel="ลงทะเบียน"
              showAcceptTerms
              photo={{ value: photo, onError: setPhotoError }}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
      {submitting && <SubmitOverlay />}
    </main>
  );
}

export default function RegisterPage() {
  // useSearchParams ต้องอยู่ใน Suspense boundary (Next app-router)
  return (
    <Suspense>
      <RegisterInner />
    </Suspense>
  );
}
