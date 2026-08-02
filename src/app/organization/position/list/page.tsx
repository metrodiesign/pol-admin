import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { OrgUnitListView } from "@/components/organization/org-unit/view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export const metadata: Metadata = {
  title: "ตำแหน่ง | POL",
};

export default function PositionListPage() {
  return (
    <>
      <PageHeader
        title="ตำแหน่ง"
        breadcrumbs={[{ label: "Console" }, { label: "ตำแหน่ง" }]}
        action={{ label: "เพิ่มตำแหน่ง", href: "/organization/position/create" }}
      />
      <OrgUnitListView config={ORG_UNIT_CONFIGS.position} />
    </>
  );
}
