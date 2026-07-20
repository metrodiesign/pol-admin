import { EditPageHeader } from "@/components/shared/edit-page-header";
import { TenantDetailView } from "@/components/control/tenant/tenant-detail-view";

export const metadata = {
  title: "รายละเอียด Merchant | POL Admin",
};

export default async function TenantReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียด Merchant"
        backHref="/control/tenants"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "Tenants & Workspaces", href: "/control/tenants" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <TenantDetailView id={id} />
    </>
  );
}
