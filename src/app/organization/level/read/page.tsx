import { redirect } from "next/navigation";

import { LevelReadView } from "@/components/organization/level/read-view";

export default async function LevelReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/level/list");
  return <LevelReadView id={id} />;
}
