import { EditPageHeader } from "@/components/shared/edit-page-header";
import { SettlementDetailView } from "@/components/control/reconciliation/settlement-detail-view";

export const metadata = {
  title: "รายละเอียดการกระทบยอด | POL Admin",
};

export default async function ReconciliationReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียดการกระทบยอด"
        backHref="/control/reconciliation"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "การกระทบยอด", href: "/control/reconciliation" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <SettlementDetailView id={id} />
    </>
  );
}
