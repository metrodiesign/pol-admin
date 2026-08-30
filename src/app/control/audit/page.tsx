import { PageHeader } from "@/components/shared/page-header";
import { AuditLogView } from "@/components/control/audit/log-view";

export const metadata = {
  title: "บันทึกการตรวจสอบ | POL Admin",
};

export default function AuditLogPage() {
  return (
    <>
      <PageHeader
        title="บันทึกการตรวจสอบ"
        breadcrumbs={[
          { label: "บันทึกการตรวจสอบ", href: "/control/audit" },
          { label: "รายชื่อ" },
        ]}
      />
      <AuditLogView />
    </>
  );
}
