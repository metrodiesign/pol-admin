import { PageHeader } from "@/components/shared/page-header";
import { PspConnectionsView } from "@/components/control/psp/psp-connections-view";

export const metadata = {
  title: "การเชื่อมต่อ PSP | POL Admin",
};

export default function PspConnectionsPage() {
  return (
    <>
      <PageHeader
        title="การเชื่อมต่อ PSP"
        description="การเชื่อมต่อกับผู้ให้บริการรับชำระเงิน (PSP) ของแต่ละบริษัทในเครือ — ดูสถานะ คีย์ และโหมดรับชำระแบบ redirect-only"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "การเชื่อมต่อ PSP" },
        ]}
      />
      <PspConnectionsView />
    </>
  );
}
