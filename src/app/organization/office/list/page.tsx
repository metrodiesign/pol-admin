import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { OfficeListView } from "@/components/organization/office/list-view";

export const metadata: Metadata = {
  title: "สำนักงาน | POL",
};

export default function OfficeListPage() {
  return (
    <>
      <PageHeader
        title="สำนักงาน"
        breadcrumbs={[{ label: "Console" }, { label: "สำนักงาน" }]}
        action={{ label: "เพิ่มสำนักงาน", href: "/organization/office/create" }}
      />
      <OfficeListView />
    </>
  );
}
