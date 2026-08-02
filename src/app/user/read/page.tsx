"use client";

import Link from "next/link";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { UserEditProfileCard } from "@/components/user/user-edit-profile-card";
import { UserEditFormCard } from "@/components/user/user-edit-form-card";

const cancelClass =
  "inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

export default function UserReadPage() {
  return (
    <>
      <EditPageHeader
        title="ดูรายละเอียด"
        backHref="/user/list"
        breadcrumbs={[
          { label: "ผู้ใช้งาน & สิทธิ์", href: "/user/list" },
          { label: "Angelique Morse" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/user/list" className={cancelClass}>
              ยกเลิก
            </Link>
            <Link
              href="/user/edit"
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              แก้ไข
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        <div className="mmd:col-span-4">
          <UserEditProfileCard
            avatarUrl={undefined}
            name="Angelique Morse"
            status="pending"
            readOnly
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
            readOnly
          />
        </div>
      </div>
    </>
  );
}
