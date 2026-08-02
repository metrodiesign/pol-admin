import { EditPageHeader } from "@/components/shared/edit-page-header";
import { RoutingDetailView } from "@/components/control/routing/detail-view";

export const metadata = {
  title: "รายละเอียด Routing Rule | POL Admin",
};

export default async function RoutingReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียด Routing Rule"
        backHref="/control/routing"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "Routing Rules", href: "/control/routing" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <RoutingDetailView id={id} />
    </>
  );
}
