import { redirect } from "next/navigation";

import { PERMISSION_CATALOG, ROLES, RESOURCE_GROUPS } from "@/lib/mock/producer-role";
import { RoleReadView } from "@/components/producer-role/role-read-view";

export default async function RoleReadPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const role = ROLES.find((r) => r.code === code);
  if (!role) redirect("/producer/role/list");
  return (
    <RoleReadView
      role={role}
      catalog={PERMISSION_CATALOG}
      groups={RESOURCE_GROUPS}
    />
  );
}
