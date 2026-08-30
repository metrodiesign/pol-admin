import { PspConnectionsView } from "@/components/control/psp/connections-view";
import { PspRouteGate } from "@/components/control/psp/psp-route-gate";

export const metadata = {
  title: "การเชื่อมต่อ PSP | POL Admin",
};

export default function PspConnectionsPage() {
  return (
    <PspRouteGate requiredPermissions={["settings.manage"]}>
      <PspConnectionsView />
    </PspRouteGate>
  );
}
