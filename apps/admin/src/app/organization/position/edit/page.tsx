import { redirect } from "next/navigation";

import { PositionEditView } from "@/components/organization/position/edit-view";

export default async function PositionEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/position/list");
  return <PositionEditView id={id} />;
}
