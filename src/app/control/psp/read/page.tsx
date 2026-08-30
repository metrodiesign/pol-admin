import { PspDetailView } from "@/components/control/psp/detail-view";
import { PspRouteGate } from "@/components/control/psp/psp-route-gate";
import { normalizePspConnectionId } from "@/lib/control/psp";
import { notFound } from "next/navigation";

export const metadata = {
  title: "รายละเอียด PSP Connection | POL Admin",
};

export default async function PspReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; notice?: string }>;
}) {
  const { id, notice } = await searchParams;
  const connectionId = normalizePspConnectionId(id);
  if (!connectionId) notFound();

  return (
    <PspRouteGate requiredPermissions={["settings.manage"]}>
      <PspDetailView
        key={connectionId}
        id={connectionId}
        credentialRequested={notice === "credential-requested"}
      />
    </PspRouteGate>
  );
}
