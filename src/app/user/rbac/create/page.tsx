import { RBAC_ROLES } from "@/lib/mock/rbac";
import { RbacRoleCreateView } from "@/components/rbac/rbac-role-create-view";

export default async function RbacCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  // from = code ของบทบาทต้นทาง (โหมดทำสำเนา); ไม่พบ = สร้างใหม่
  const source = from ? RBAC_ROLES.find((r) => r.code === from) ?? null : null;
  return <RbacRoleCreateView source={source} />;
}
