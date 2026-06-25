import { PageHeader } from "@/components/shared/page-header";
import { ReportsView } from "@/components/control/reports/reports-view";

export const metadata = {
  title: "รายงาน | POL Admin",
};

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="รายงาน"
        description="ภาพรวมการชำระเงิน — สัดส่วนตาม PSP ช่องทาง และผู้ส่งงานสูงสุด"
        breadcrumbs={[{ label: "Control plane" }, { label: "รายงาน" }]}
      />
      <ReportsView />
    </>
  );
}
