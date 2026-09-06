import { notFound } from "next/navigation";

import { MerchantPaymentSettingsView } from "@/components/control/psp/settings/view";
import { PspRouteGate } from "@/components/control/psp/psp-route-gate";
import { normalizeUuid } from "@/lib/control/psp";

export const metadata = {
  title: "ตั้งค่าการรับชำระของร้านค้า | POL Admin",
};

export default async function MerchantPaymentSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ merchantId?: string }>;
}) {
  const { merchantId } = await searchParams;
  const canonical = normalizeUuid(merchantId);
  if (!canonical) notFound();

  return (
    <PspRouteGate requiredPermissions={["settings.manage", "merchant.view"]}>
      <MerchantPaymentSettingsView key={canonical} merchantId={canonical} />
    </PspRouteGate>
  );
}
