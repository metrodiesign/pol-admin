"use client";

import { useState } from "react";
import type { ProducerStatus } from "@/types/producer";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ProducerEditProfileCard } from "@/components/producer/producer-edit-profile-card";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";

const AVATAR =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-1.webp";

export default function ProducerEditPage() {
  const [banned, setBanned] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  // เริ่มที่ "รอตรวจสอบ" เพื่อให้ admin เห็นปุ่มอนุมัติ (UI shell — flip เป็น active ในเครื่อง)
  const [status, setStatus] = useState<ProducerStatus>("pending");

  return (
    <>
      <EditPageHeader
        title="แก้ไข"
        backHref="/producer/list"
        breadcrumbs={[
          { label: "ตัวแทน/นายหน้า", href: "/producer/list" },
          { label: "สมชาย ใจดี" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        <div className="mmd:col-span-4">
          <ProducerEditProfileCard
            avatarUrl={AVATAR}
            name="สมชาย ใจดี"
            status={status}
            banned={banned}
            emailVerified={emailVerified}
            onBannedChange={setBanned}
            onEmailVerifiedChange={setEmailVerified}
            onDeleteProducer={() => {}}
            onApprove={() => setStatus("active")}
          />
        </div>
        <div className="mmd:col-span-8">
          <ProducerEditFormCard
            initialData={{
              firstName: "สมชาย",
              lastName: "ใจดี",
              personType: "individual",
              idNumber: "1103702450000",
              producerCode: "AG10001",
              licenseNumber: "1234567890",
              phoneNumber: "0970000001",
              email: "somchai.j@viriyah.co.th",
              acceptTerms: true,
            }}
            submitLabel="บันทึก"
            cancelHref="/producer/list"
          />
        </div>
      </div>
    </>
  );
}
