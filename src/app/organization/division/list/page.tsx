import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { OrgUnitListView } from "@/components/organization/org-unit/view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

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
      <OrgUnitListView config={ORG_UNIT_CONFIGS.division} />
    </>
  );
}
