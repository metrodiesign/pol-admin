"use client";

import { useState } from "react";
import Link from "next/link";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { Fieldset, Field, Label, Description } from "@/components/shared/fieldset";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";
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
  "mt-8 inline-flex h-9 min-w-[160px] items-center justify-center rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900 dark:bg-white dark:text-grey-900 dark:hover:bg-grey-300";

export default function RegisterPage() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-grey-100 p-4">
        <div
          className="w-full max-w-md rounded-card bg-card px-6 py-10 text-center"
          style={cardStyle}
        >
          <h1 className="text-xl font-bold text-foreground">ลงทะเบียนสำเร็จ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            รอการอนุมัติจากผู้ดูแลระบบ
          </p>
          <Link href="/login" className={linkButtonClass}>
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-grey-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold text-foreground">การลงทะเบียนตัวแทน</h1>

        <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
          <div className="mmd:col-span-4">
            <div
              className="rounded-card bg-card px-6 pb-10 pt-20"
              style={cardStyle}
            >
              <AvatarUpload
                size={144}
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
              onSave={() => setSubmitted(true)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
