import { PageHeader } from "@/components/shared/page-header";
import { PspConnectionsView } from "@/components/control/psp/psp-connections-view";

export const metadata = {
  title: "PSP Connections | POL Admin",
};

export default function PspConnectionsPage() {
  return (
    <>
      <PageHeader
        title="PSP Connections"
        description="การเชื่อมต่อกับผู้ให้บริการรับชำระเงิน (PSP) ของแต่ละบริษัทในเครือ — ดูสถานะ คีย์ และโหมดรับชำระแบบ redirect-only"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "PSP Connections" },
        ]}
      />
      <PspConnectionsView />
    </>
  );
}
