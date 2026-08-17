import { EditPageHeader } from "@/components/shared/edit-page-header";
import { AuditDetailView } from "@/components/control/audit/detail-view";

export const metadata = {
  title: "รายละเอียด Audit Log | POL Admin",
};

export default async function AuditReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียด Audit Log"
        backHref="/control/audit"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "Audit Log", href: "/control/audit" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <AuditDetailView id={id} />
    </>
  );
}
