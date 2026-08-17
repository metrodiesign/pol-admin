import { redirect } from "next/navigation";

import { OfficeEditView } from "@/components/organization/office/edit-view";

export default async function OfficeEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/office/list");
  return <OfficeEditView id={id} />;
}
