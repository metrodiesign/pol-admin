"use client";

import { useState } from "react";
import Link from "next/link";
import type { MerchantUserStatus } from "@/types/merchant-user";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ProducerEditProfileCard } from "@/components/producer/producer-edit-profile-card";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";

const cancelClass =
  "inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

export default function ProducerReadPage() {
  // เริ่มที่ "รอตรวจสอบ" เพื่อให้ admin เห็นปุ่มอนุมัติ/ไม่อนุมัติ (UI shell — flip เป็น active ในเครื่อง)
  const [status, setStatus] = useState<MerchantUserStatus>("PendingApproval");

  return (
    <>
      <EditPageHeader
        title="ดูข้อมูล"
        backHref="/producer/list"
        breadcrumbs={[
          { label: "ตัวแทน/นายหน้า", href: "/producer/list" },
          { label: "สมชาย ใจดี" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/producer/list" className={cancelClass}>
              ยกเลิก
            </Link>
            <Link
              href="/producer/edit"
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              แก้ไข
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        <div className="mmd:col-span-4">
          <ProducerEditProfileCard
            name="สมชาย ใจดี"
            status={status}
            onApprove={() => setStatus("Active")}
            onReject={() => setStatus("Rejected")}
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
          />
        </div>
      </div>
    </>
  );
}
