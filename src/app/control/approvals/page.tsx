import { PageHeader } from "@/components/shared/page-header";
import { ApprovalsView } from "@/components/control/approval/approvals-view";

export const metadata = {
  title: "Approvals | POL Admin",
};

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        title="Approvals"
        description="คำขอที่ต้องให้ผู้ตรวจสอบคนที่สองอนุมัติก่อนดำเนินการ (maker-checker) — ผู้ขอไม่สามารถอนุมัติคำขอของตนเองได้"
        breadcrumbs={[{ label: "Control plane" }, { label: "Approvals" }]}
      />
      <ApprovalsView />
    </>
  );
}
