import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ApiClientDetailView } from "@/components/control/api-client/api-client-detail-view";

export const metadata = {
  title: "รายละเอียด API Client | POL Admin",
};

export default async function ApiClientReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียด API Client"
        backHref="/control/api-clients"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "API Clients", href: "/control/api-clients" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <ApiClientDetailView id={id} />
    </>
  );
}
