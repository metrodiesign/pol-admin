import { redirect } from "next/navigation";

import { RoleEditView } from "@/components/role/role-edit-view";

export default async function RoleEditPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (!code) redirect("/user/role/list");
  return <RoleEditView code={code} />;
}
