import { PageHeader } from "@/components/shared/page-header";
import { AuditLogView } from "@/components/control/audit/audit-log-view";

export const metadata = {
  title: "บันทึกการตรวจสอบ | POL Admin",
};

export default function AuditLogPage() {
  return (
    <>
      <PageHeader
        title="บันทึกการตรวจสอบ"
        description="บันทึกการกระทำสำคัญทั้งหมดในระบบ — อ่านอย่างเดียว แก้ไขหรือลบไม่ได้"
        breadcrumbs={[{ label: "Control plane" }, { label: "บันทึกการตรวจสอบ" }]}
      />
      <AuditLogView />
    </>
  );
}
