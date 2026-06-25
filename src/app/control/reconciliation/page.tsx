import { PageHeader } from "@/components/shared/page-header";
import { ReconciliationView } from "@/components/control/reconciliation/reconciliation-view";

export const metadata = {
  title: "การกระทบยอด | POL Admin",
};

export default function ReconciliationPage() {
  return (
    <>
      <PageHeader
        title="การกระทบยอด"
        description="ตรวจยอดที่ PSP โอนเข้าบริษัทเทียบกับยอดที่คาดไว้ — เงิน settle เข้าบัญชีบริษัทโดยตรง แพลตฟอร์มติดตามสถานะเท่านั้น"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "การกระทบยอด" },
        ]}
      />
      <ReconciliationView />
    </>
  );
}
