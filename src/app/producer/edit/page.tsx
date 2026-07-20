"use client";

import { useState } from "react";
import type { MerchantUserStatus } from "@/types/merchant-user";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ProducerEditProfileCard } from "@/components/producer/producer-edit-profile-card";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";

export default function ProducerEditPage() {
  const [suspended, setSuspended] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  // เริ่มที่ "รอตรวจสอบ" เพื่อให้ admin เห็นปุ่มอนุมัติ (UI shell — flip เป็น active ในเครื่อง)
  const [status, setStatus] = useState<MerchantUserStatus>("PendingApproval");

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
            name="สมชาย ใจดี"
            status={status}
            suspended={suspended}
            emailVerified={emailVerified}
            onSuspendedChange={setSuspended}
            onEmailVerifiedChange={setEmailVerified}
            onDeleteProducer={() => {}}
            onApprove={() => setStatus("Active")}
          />
        </div>
        <div className="mmd:col-span-8">
          <ProducerEditFormCard
            initialData={{
              firstName: "สมชาย",
              lastName: "ใจดี",
              personType: "Individual",
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
