import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ผู้ใช้งาน & สิทธิ์ | POL",
};

import { PageHeader } from "@/components/shared/page-header";
import { UserListView } from "@/components/admin/user/list-view";

export default function UserListPage() {
  return (
    <>
      <PageHeader
        title="รายชื่อผู้ใช้งาน"
        breadcrumbs={[
          { label: "ผู้ใช้งาน & สิทธิ์", href: "/admin/user/list" },
          { label: "รายชื่อ" },
        ]}
        action={{ label: "เพิ่มผู้ใช้งาน", href: "/admin/user/new" }}
      />
      <UserListView />
    </>
  );
}
