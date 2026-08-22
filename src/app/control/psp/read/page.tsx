import { EditPageHeader } from "@/components/shared/edit-page-header";
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
    <>
      <EditPageHeader
        title="รายละเอียด PSP Connection"
        backHref="/control/psp/list"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "PSP Connections", href: "/control/psp/list" },
          { label: connectionId },
        ]}
      />
      <PspRouteGate requiredPermissions={["settings.manage"]}>
        <PspDetailView
          key={connectionId}
          id={connectionId}
          credentialRequested={notice === "credential-requested"}
        />
      </PspRouteGate>
    </>
  );
}
