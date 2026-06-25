import { PageHeader } from "@/components/shared/page-header";
import { TenantsView } from "@/components/control/tenant/tenants-view";

export const metadata = {
  title: "Tenants & Workspaces | POL Admin",
};

export default function TenantsPage() {
  return (
    <>
      <PageHeader
        title="Tenants & Workspaces"
        description="บริษัทในเครือที่ใช้แพลตฟอร์ม — แต่ละบริษัทเป็นนิติบุคคลแยก จัดการได้เฉพาะผู้ดูแลระดับ Super"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "Tenants & Workspaces" },
        ]}
      />
      <TenantsView />
    </>
  );
}
