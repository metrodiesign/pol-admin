import type { Metadata } from "next";

import { OrgUnitListView } from "@/components/organization/org-unit/view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export const metadata: Metadata = {
  title: "ระดับ | POL",
};

export default function LevelListPage() {
  return <OrgUnitListView config={ORG_UNIT_CONFIGS.level} />;
}
