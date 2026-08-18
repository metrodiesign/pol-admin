import { EditPageHeader } from "@/components/shared/edit-page-header";
import { OriginatorDetailView } from "@/components/control/originator/detail-view";

export const metadata = {
  title: "รายละเอียด Originator | POL Admin",
};

export default async function OriginatorReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียด Originator"
        backHref="/control/originators"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "Originators", href: "/control/originators" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <OriginatorDetailView id={id} />
    </>
  );
}
