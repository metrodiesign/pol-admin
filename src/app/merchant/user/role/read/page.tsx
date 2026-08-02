import { redirect } from "next/navigation";

import { PERMISSION_CATALOG, ROLES, RESOURCE_GROUPS } from "@/lib/mock/merchant/user/role";
import { RoleReadView } from "@/components/merchant/user/role/read-view";

export default async function RoleReadPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const role = ROLES.find((r) => r.code === code);
  if (!role) redirect("/merchant/user/role/list");
  return (
    <RoleReadView
      role={role}
      catalog={PERMISSION_CATALOG}
      groups={RESOURCE_GROUPS}
    />
  );
}
