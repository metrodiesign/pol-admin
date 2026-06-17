import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ผู้ใช้งาน & สิทธิ์ | POL",
};

import { PageHeader } from "@/components/shared/page-header";
import { UserListView } from "@/components/user/user-list-view";

export default function UserListPage() {
  return (
    <>
      <PageHeader
        title="List"
        breadcrumbs={[
          { label: "ผู้ใช้งาน & สิทธิ์", href: "/user/list" },
          { label: "List" },
        ]}
        action={{ label: "Add user", href: "/user/new" }}
      />
      <UserListView />
    </>
  );
}
