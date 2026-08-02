import type { Metadata } from "next";

import { OrgUnitListView } from "@/components/organization/org-unit/view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export const metadata: Metadata = {
  title: "แผนก | POL",
};

export default function DivisionListPage() {
  return <OrgUnitListView config={ORG_UNIT_CONFIGS.division} />;
}
