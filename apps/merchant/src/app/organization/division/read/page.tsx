import { redirect } from "next/navigation";

import { DivisionReadView } from "@/components/organization/division/read-view";

export default async function DivisionReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/division/list");
  return <DivisionReadView id={id} />;
}
