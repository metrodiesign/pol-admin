import { OrgUnitCreateView } from "@/components/organization/org-unit/create-view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export default function DivisionCreatePage() {
  return <OrgUnitCreateView config={ORG_UNIT_CONFIGS.division} />;
}
