import { EditPageHeader } from "@/components/shared/edit-page-header";
import { PspDetailView } from "@/components/control/psp/psp-detail-view";

export const metadata = {
  title: "รายละเอียด PSP Connection | POL Admin",
};

export default async function PspReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียด PSP Connection"
        backHref="/control/psp/list"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "PSP Connections", href: "/control/psp/list" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <PspDetailView id={id} />
    </>
  );
}
