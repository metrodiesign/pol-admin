import { notFound } from "next/navigation";

import { PspEditView } from "@/components/control/psp/edit-view";
import { PspRouteGate } from "@/components/control/psp/psp-route-gate";
import { normalizePspConnectionId } from "@/lib/control/psp";

export const metadata = { title: "แก้ไข PSP Connection | POL Admin" };

export default async function PspEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const connectionId = normalizePspConnectionId(id);
  if (!connectionId) notFound();

  return (
    <PspRouteGate requiredPermissions={["settings.manage", "merchant.manage"]}>
      <PspEditView key={connectionId} id={connectionId} />
    </PspRouteGate>
  );
}
