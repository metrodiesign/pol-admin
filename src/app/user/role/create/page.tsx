import { ROLES } from "@/lib/mock/role";
import { RoleCreateView } from "@/components/role/role-create-view";

export default async function RoleCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  // from = code ของบทบาทต้นทาง (โหมดทำสำเนา); ไม่พบ = สร้างใหม่
  const source = from ? ROLES.find((r) => r.code === from) ?? null : null;
  return <RoleCreateView source={source} />;
}
