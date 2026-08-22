import { PageHeader } from "@/components/shared/page-header";
import { PspConnectionsView } from "@/components/control/psp/connections-view";
import { PspRouteGate } from "@/components/control/psp/psp-route-gate";

export const metadata = {
  title: "การเชื่อมต่อ PSP | POL Admin",
};

export default function PspConnectionsPage() {
  return (
    <>
      <PageHeader
        title="การเชื่อมต่อ PSP"
        description="ติดตามการเชื่อมต่อกับผู้ให้บริการรับชำระเงิน แยกสถานะ Enabled, Health และ Approval"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "การเชื่อมต่อ PSP" },
        ]}
      />
      <PspRouteGate requiredPermissions={["settings.manage"]}>
        <PspConnectionsView />
      </PspRouteGate>
    </>
  );
}
