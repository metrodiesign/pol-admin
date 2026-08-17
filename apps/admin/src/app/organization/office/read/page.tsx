import { redirect } from "next/navigation";

import { OfficeReadView } from "@/components/organization/office/read-view";

export default async function OfficeReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/organization/office/list");
  return <OfficeReadView id={id} />;
}
