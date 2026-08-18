import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { DivisionListView } from "@/components/organization/division/list-view";

export const metadata: Metadata = {
  title: "แผนก | POL",
};

export default function DivisionListPage() {
  return (
    <>
      <PageHeader
        title="แผนก"
        breadcrumbs={[{ label: "Console" }, { label: "แผนก" }]}
        action={{ label: "เพิ่มแผนก", href: "/organization/division/create" }}
      />
      <DivisionListView />
    </>
  );
}
