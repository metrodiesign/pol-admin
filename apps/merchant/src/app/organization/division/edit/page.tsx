import { redirect } from "next/navigation";

import { DivisionEditView } from "@/components/organization/division/edit-view";

export default async function DivisionEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/division/list");
  return <DivisionEditView id={id} />;
}
