import { PageHeader } from "@/components/shared/page-header";
import { ReconciliationView } from "@/components/control/reconciliation/view";

export const metadata = {
  title: "การกระทบยอด | POL Admin",
};

export default function ReconciliationPage() {
  return (
    <>
      <PageHeader
        title="การกระทบยอด"
        breadcrumbs={[
          { label: "การกระทบยอด", href: "/control/reconciliation" },
          { label: "รายชื่อ" },
        ]}
      />
      <ReconciliationView />
    </>
  );
}
