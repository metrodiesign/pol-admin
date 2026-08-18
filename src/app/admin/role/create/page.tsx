import { RoleCreateView } from "@/components/admin/role/create-view";

export default async function RoleCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  // from = code ของบทบาทต้นทาง (โหมดทำสำเนา); view โหลด list เองเพื่อ prefill + เช็ค code ซ้ำ
  return <RoleCreateView from={from ?? null} />;
}
