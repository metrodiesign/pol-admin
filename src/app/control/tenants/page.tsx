import { PageHeader } from "@/components/shared/page-header";
import { TenantsView } from "@/components/control/tenant/view";

export const metadata = {
  title: "ผู้เช่าและพื้นที่ทำงาน | POL Admin",
};

export default function TenantsPage() {
  return (
    <>
      <PageHeader
        title="ผู้เช่าและพื้นที่ทำงาน"
        description="บริษัทในเครือที่ใช้แพลตฟอร์ม — แต่ละบริษัทเป็นนิติบุคคลแยก จัดการได้เฉพาะผู้ดูแลระดับ Super"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "ผู้เช่าและพื้นที่ทำงาน" },
        ]}
      />
      <TenantsView />
    </>
  );
}
