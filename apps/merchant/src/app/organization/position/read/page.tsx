import { redirect } from "next/navigation";

import { PositionReadView } from "@/components/organization/position/read-view";

export default async function PositionReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/position/list");
  return <PositionReadView id={id} />;
}
