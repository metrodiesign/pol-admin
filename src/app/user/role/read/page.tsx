import { redirect } from "next/navigation";

import { PERMISSION_CATALOG, ROLES, RESOURCE_GROUPS } from "@/lib/mock/role";
import { RoleReadView } from "@/components/role/role-read-view";

export default async function RoleReadPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const role = ROLES.find((r) => r.code === code);
  if (!role) redirect("/user/role/list");
  return (
    <RoleReadView
      role={role}
      catalog={PERMISSION_CATALOG}
      groups={RESOURCE_GROUPS}
    />
  );
}
