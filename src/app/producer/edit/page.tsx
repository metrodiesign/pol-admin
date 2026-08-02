"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MerchantUserStatus } from "@/types/merchant-user";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ProducerEditProfileCard } from "@/components/producer/producer-edit-profile-card";
import { ProducerEditFormCard } from "@/components/producer/producer-edit-form-card";
import { ConfirmDialog } from "@/components/policy/confirm-dialog";

const cancelClass =
  "inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

const FORM_ID = "producer-edit-form";

export default function ProducerEditPage() {
  const router = useRouter();
  const [suspended, setSuspended] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  // เริ่มที่ "รอตรวจสอบ" เพื่อให้ admin เห็นปุ่มอนุมัติ (UI shell — flip เป็น active ในเครื่อง)
  const [status, setStatus] = useState<MerchantUserStatus>("PendingApproval");
  const [confirmAction, setConfirmAction] = useState<"cancel" | "save" | null>(null);

  return (
    <>
      <EditPageHeader
        title="แก้ไข"
        backHref="/producer/list"
        breadcrumbs={[
          { label: "ตัวแทน/นายหน้า", href: "/producer/list" },
          { label: "สมชาย ใจดี" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmAction("cancel")}
              className={cancelClass}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction("save")}
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              บันทึก
            </button>
          </div>
        }
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
            formId={FORM_ID}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === "cancel"}
        title="ต้องการออกจากหน้านี้?"
        description="ข้อมูลที่แก้ไขในหน้านี้จะไม่ถูกบันทึก"
        confirmLabel="ออกจากหน้านี้"
        onConfirm={() => router.push("/producer/list")}
        onClose={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "save"}
        title="ยืนยันการบันทึก?"
        description="ระบบจะบันทึกข้อมูลตัวแทน/นายหน้าตามที่แก้ไขในหน้านี้"
        confirmLabel="ยืนยัน"
        onConfirm={() => {
          setConfirmAction(null);
          (document.getElementById(FORM_ID) as HTMLFormElement | null)?.requestSubmit();
        }}
        onClose={() => setConfirmAction(null)}
      />
    </>
  );
}
