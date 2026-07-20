"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { Fieldset, Field, Label, Description } from "@/components/shared/fieldset";
import { Switch } from "@/components/ui/switch";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";

export default function ProducerCreatePage() {
  const [emailVerified, setEmailVerified] = useState(true);

  return (
    <>
      <PageHeader
        title="ลงทะเบียนตัวแทนใหม่"
        breadcrumbs={[
          { label: "ตัวแทน/นายหน้า", href: "/producer/list" },
          { label: "ลงทะเบียน" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        <div className="mmd:col-span-4">
          <div
            className="rounded-card bg-card px-6 pb-10 pt-20"
            style={{
              boxShadow:
                "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
            }}
          >
            <AvatarUpload size={144} />

            <Fieldset aria-label="การตั้งค่าบัญชี" className="mt-10">
              <div className="space-y-5">
                <Field className="flex-row items-start justify-between gap-4">
                  <div>
                    <Label className="text-sm font-semibold">รูปถ่ายตัวแทน + บัตรประชาชน</Label>
                    <Description>
                      แนบรูปถ่ายตัวแทนพร้อมกับบัตรประชาชนผ่านปุ่มอัปโหลดด้านบน
                    </Description>
                  </div>
                </Field>

                <Field className="flex-row items-start justify-between gap-4">
                  <div>
                    <Label className="text-sm font-semibold">ยืนยันอีเมลแล้ว</Label>
                    <Description>
                      หากปิด ระบบจะส่งอีเมลยืนยันให้ตัวแทนโดยอัตโนมัติ
                    </Description>
                  </div>
                  <Switch
                    checked={emailVerified}
                    onCheckedChange={setEmailVerified}
                    className="data-checked:bg-success"
                  />
                </Field>
              </div>
            </Fieldset>
          </div>
        </div>

        <div className="mmd:col-span-8">
          <ProducerEditFormCard
            initialData={{
              firstName: "",
              lastName: "",
              personType: "Individual",
              idNumber: "",
              producerCode: "",
              licenseNumber: "",
              phoneNumber: "",
              email: "",
              acceptTerms: false,
            }}
            submitLabel="ลงทะเบียน"
            showAcceptTerms
            cancelHref="/producer/list"
          />
        </div>
      </div>
    </>
  );
}
