"use client";

import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { UserEditFormCard } from "@/components/user/user-edit-form-card";

export default function UserCreatePage() {
  return (
    <>
      <PageHeader
        title="เพิ่มผู้ใช้งานใหม่"
        breadcrumbs={[
          { label: "ผู้ใช้งาน & สิทธิ์", href: "/user/list" },
          { label: "เพิ่มใหม่" },
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
          </div>
        </div>

        <div className="mmd:col-span-8">
          <UserEditFormCard
            initialData={{
              firstName: "",
              lastName: "",
              email: "",
              status: "active",
              office: "",
              department: "",
              position: "",
              level: "",
              roles: [],
            }}
            submitLabel="เพิ่มผู้ใช้งาน"
            cancelHref="/user/list"
          />
        </div>
      </div>
    </>
  );
}
