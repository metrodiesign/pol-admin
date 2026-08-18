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
          { label: "Dashboard", href: "/minimals" },
          { label: "User", href: "/minimals/user" },
          { label: "List" },
        ]}
        action={{ label: "Add user", href: "/minimals/user/new" }}
      />
      <UserListView />
    </>
  );
}
