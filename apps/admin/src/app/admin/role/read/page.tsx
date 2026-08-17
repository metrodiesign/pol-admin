import { redirect } from "next/navigation";

import { RoleReadView } from "@/components/admin/role/read-view";

export default async function RoleReadPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (!code) redirect("/admin/role/list");
  return <RoleReadView code={code} />;
}
