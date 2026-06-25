import { PageHeader } from "@/components/shared/page-header";
import { RoutingRulesView } from "@/components/control/routing/routing-rules-view";

export const metadata = {
  title: "Routing Rules | POL Admin",
};

export default function RoutingRulesPage() {
  return (
    <>
      <PageHeader
        title="Routing Rules"
        description="กำหนดว่าการชำระเงินแต่ละแบบจะส่งไปยัง PSP รายใด พร้อมลำดับความสำคัญและตัวสำรอง"
        breadcrumbs={[{ label: "Control plane" }, { label: "Routing Rules" }]}
      />
      <RoutingRulesView />
    </>
  );
}
