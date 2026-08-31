import { PageHeader } from "@/components/shared/page-header";
import { ReportsView } from "@/components/control/reports/view";

export const metadata = {
  title: "รายงาน | POL Admin",
};

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="รายงาน"
        breadcrumbs={[
          { label: "รายงาน", href: "/control/reports" },
          { label: "รายชื่อ" },
        ]}
      />
      <ReportsView />
    </>
  );
}
