import { PspCreateView } from "@/components/control/psp/create-view";
import { PspRouteGate } from "@/components/control/psp/psp-route-gate";

export const metadata = { title: "เพิ่ม PSP Connection | POL Admin" };

export default function PspCreatePage() {
  return (
    <PspRouteGate
      requiredPermissions={["settings.manage", "merchant.manage", "merchant.view"]}
    >
      <PspCreateView />
    </PspRouteGate>
  );
}
