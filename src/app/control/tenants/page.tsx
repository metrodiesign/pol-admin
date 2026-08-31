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
        breadcrumbs={[
          { label: "Tenants & Workspaces", href: "/control/tenants" },
          { label: "รายชื่อ" },
        ]}
      />
      <TenantsView />
    </>
  );
}
