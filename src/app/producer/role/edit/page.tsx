import { redirect } from "next/navigation";

import { ROLES } from "@/lib/mock/producer-role";
import { RoleEditView } from "@/components/producer-role/role-edit-view";

export default async function RoleEditPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const role = ROLES.find((r) => r.code === code);
  if (!role) redirect("/producer/role/list");
  return <RoleEditView role={role} />;
}
