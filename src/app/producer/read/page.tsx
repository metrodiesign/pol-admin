"use client";

import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ProducerEditProfileCard } from "@/components/producer/producer-edit-profile-card";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";

const noop = () => {};

export default function ProducerReadPage() {
  return (
    <>
      <EditPageHeader
        title="ดูข้อมูล"
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
            status="Active"
            suspended={false}
            emailVerified={true}
            onSuspendedChange={noop}
            onEmailVerifiedChange={noop}
            onDeleteProducer={noop}
            readOnly
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
            readOnly
            cancelHref="/producer/list"
          />
        </div>
      </div>
    </>
  );
}
