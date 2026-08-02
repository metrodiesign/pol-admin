import { redirect } from "next/navigation";

import { OrgUnitReadView } from "@/components/organization/org-unit/read-view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export default async function DivisionReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/division/list");
  return <OrgUnitReadView config={ORG_UNIT_CONFIGS.division} id={id} />;
}
