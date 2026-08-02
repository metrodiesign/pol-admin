import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { OrgUnitListView } from "@/components/organization/org-unit/view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

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
      <OrgUnitListView config={ORG_UNIT_CONFIGS.office} />
    </>
  );
}
