import { redirect } from "next/navigation";

import { RBAC_ROLES } from "@/lib/mock/rbac";
import { RbacRoleEditView } from "@/components/rbac/rbac-role-edit-view";

export default async function RbacEditPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const role = RBAC_ROLES.find((r) => r.code === code);
  if (!role) redirect("/user/rbac");
  return <RbacRoleEditView role={role} />;
}
