import { redirect } from "next/navigation";

import { RoleEditView } from "@/components/admin/role/edit-view";

export default async function RoleEditPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (!code) redirect("/admin/role/list");
  return <RoleEditView code={code} />;
}
