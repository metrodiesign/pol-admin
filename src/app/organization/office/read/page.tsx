import { redirect } from "next/navigation";

import { OrgUnitReadView } from "@/components/organization/org-unit/read-view";
import { ORG_UNIT_CONFIGS } from "@/lib/organization/org-unit/config";

export default async function OfficeReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/office/list");
  return <OrgUnitReadView config={ORG_UNIT_CONFIGS.office} id={id} />;
}
