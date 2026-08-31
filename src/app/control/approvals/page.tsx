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
        breadcrumbs={[
          { label: "การอนุมัติ", href: "/control/approvals" },
          { label: "รายชื่อ" },
        ]}
      />
      <ApprovalsView />
    </>
  );
}
