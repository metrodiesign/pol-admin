import { redirect } from "next/navigation";

import { LevelEditView } from "@/components/organization/level/edit-view";

export default async function LevelEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/level/list");
  return <LevelEditView id={id} />;
}
