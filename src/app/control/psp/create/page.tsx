import { PspCreateView } from "@/components/control/psp/create-view";
import { PspRouteGate } from "@/components/control/psp/psp-route-gate";
import { normalizeUuid } from "@/lib/control/psp";

export const metadata = { title: "เพิ่ม PSP Connection | POL Admin" };

export default async function PspCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ merchantId?: string; psp?: string; returnTo?: string }>;
}) {
  const { merchantId, psp, returnTo } = await searchParams;
  const initialProvider = psp === "2c2p" || psp === "omise" ? psp : undefined;

  return (
    <PspRouteGate
      requiredPermissions={["settings.manage", "merchant.manage", "merchant.view"]}
    >
      <PspCreateView
        initialMerchantId={normalizeUuid(merchantId) ?? undefined}
        initialProvider={initialProvider}
        returnTo={returnTo === "settings" ? "settings" : undefined}
      />
    </PspRouteGate>
  );
}
