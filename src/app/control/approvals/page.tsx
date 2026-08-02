import { PageHeader } from "@/components/shared/page-header";
import { ApprovalsView } from "@/components/control/approval/view";

export const metadata = {
  title: "การอนุมัติ | POL Admin",
};

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        title="การอนุมัติ"
        description="คำขอที่ต้องให้ผู้ตรวจสอบคนที่สองอนุมัติก่อนดำเนินการ (maker-checker) — ผู้ขอไม่สามารถอนุมัติคำขอของตนเองได้"
        breadcrumbs={[{ label: "Control plane" }, { label: "การอนุมัติ" }]}
      />
      <ApprovalsView />
    </>
  );
}
