"use client";

import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ProducerEditProfileCard } from "@/components/producer/producer-edit-profile-card";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";

const noop = () => {};

const AVATAR =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-1.webp";

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
            avatarUrl={AVATAR}
            name="สมชาย ใจดี"
            status="active"
            banned={false}
            emailVerified={true}
            onBannedChange={noop}
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
              personType: "individual",
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
