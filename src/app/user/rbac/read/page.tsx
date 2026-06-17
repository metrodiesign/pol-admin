import { redirect } from "next/navigation";

import { PERMISSION_CATALOG, RBAC_ROLES, RESOURCE_GROUPS } from "@/lib/mock/rbac";
import { RbacRoleReadView } from "@/components/rbac/rbac-role-read-view";

export default async function RbacReadPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const role = RBAC_ROLES.find((r) => r.code === code);
  if (!role) redirect("/user/rbac/list");
  return (
    <RbacRoleReadView
      role={role}
      catalog={PERMISSION_CATALOG}
      groups={RESOURCE_GROUPS}
    />
  );
}
