import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { OrgUnitListView } from "@/components/organization/org-unit/view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export const metadata: Metadata = {
  title: "ระดับ | POL",
};

export default function LevelListPage() {
  return (
    <>
      <PageHeader
        title="ระดับ"
        breadcrumbs={[{ label: "Console" }, { label: "ระดับ" }]}
        action={{ label: "เพิ่มระดับ", href: "/organization/level/create" }}
      />
      <OrgUnitListView config={ORG_UNIT_CONFIGS.level} />
    </>
  );
}
