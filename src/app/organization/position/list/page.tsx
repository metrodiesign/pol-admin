import type { Metadata } from "next";

import { OrgUnitListView } from "@/components/organization/org-unit/view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export const metadata: Metadata = {
  title: "ตำแหน่ง | POL",
};

export default function PositionListPage() {
  return <OrgUnitListView config={ORG_UNIT_CONFIGS.position} />;
}
