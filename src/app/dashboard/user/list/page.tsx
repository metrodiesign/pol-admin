import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User list | Dashboard - Minimal UI",
};

import { PageHeader } from "@/components/shared/page-header";
import { UserListView } from "@/components/dashboard/user/user-list-view";

export default function UserListPage() {
  return (
    <>
      <PageHeader
        title="List"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "User", href: "/dashboard/user" },
          { label: "List" },
        ]}
        action={{ label: "Add user", href: "/dashboard/user/new" }}
      />
      <UserListView />
    </>
  );
}
