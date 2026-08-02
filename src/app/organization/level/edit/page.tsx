import { redirect } from "next/navigation";

import { OrgUnitEditView } from "@/components/organization/org-unit/edit-view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export default async function LevelEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/level/list");
  return <OrgUnitEditView config={ORG_UNIT_CONFIGS.level} id={id} />;
}
