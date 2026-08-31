import { TenantDetailView } from "@/components/control/tenant/detail-view";

export const metadata = {
  title: "รายละเอียด Merchant | POL Admin",
};

export default async function TenantReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <TenantDetailView id={id} />;
}
