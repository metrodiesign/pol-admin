"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { UserEditProfileCard } from "@/components/admin/user/edit-profile-card";
import { UserEditFormCard } from "@/components/admin/user/edit-form-card";
import { ConfirmDialog } from "@/components/policy/confirm-dialog";

const cancelClass =
  "inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

const FORM_ID = "user-edit-form";

export default function UserEditPage() {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<"cancel" | "save" | null>(null);

  return (
    <>
      <EditPageHeader
        title="แก้ไข"
        backHref="/admin/user/list"
        breadcrumbs={[
          { label: "ผู้ใช้งาน & สิทธิ์", href: "/admin/user/list" },
          { label: "Angelique Morse" },
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
          <UserEditProfileCard
            avatarUrl={undefined}
            name="Angelique Morse"
            status="pending"
          />
        </div>
        <div className="mmd:col-span-8">
          <UserEditFormCard
            initialData={{
              firstName: "Angelique",
              lastName: "Morse",
              email: "benny89@yahoo.com",
              status: "active",
              office: "สำนักงานใหญ่",
              department: "ฝ่ายเทคโนโลยีสารสนเทศ",
              position: "พนักงาน",
              level: "Junior",
              roles: ["Content Creator"],
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
        onConfirm={() => router.push("/admin/user/list")}
        onClose={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "save"}
        title="ยืนยันการบันทึก?"
        description="ระบบจะบันทึกข้อมูลผู้ใช้งานตามที่แก้ไขในหน้านี้"
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
