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
        breadcrumbs={[
          { label: "กฎการกำหนดเส้นทาง", href: "/control/routing" },
          { label: "รายชื่อ" },
        ]}
      />
      <RoutingRulesView />
    </>
  );
}
