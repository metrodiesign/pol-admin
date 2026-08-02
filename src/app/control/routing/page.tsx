import { PageHeader } from "@/components/shared/page-header";
import { RoutingRulesView } from "@/components/control/routing/rules-view";

export const metadata = {
  title: "กฎการกำหนดเส้นทาง | POL Admin",
};

export default function RoutingRulesPage() {
  return (
    <>
      <PageHeader
        title="กฎการกำหนดเส้นทาง"
        description="กำหนดว่าการชำระเงินแต่ละแบบจะส่งไปยัง PSP รายใด พร้อมลำดับความสำคัญและตัวสำรอง"
        breadcrumbs={[{ label: "Control plane" }, { label: "กฎการกำหนดเส้นทาง" }]}
      />
      <RoutingRulesView />
    </>
  );
}
