import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ApprovalDetailView } from "@/components/control/approval/approval-detail-view";

export const metadata = {
  title: "รายละเอียดคำขออนุมัติ | POL Admin",
};

export default async function ApprovalReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <>
      <EditPageHeader
        title="รายละเอียดคำขออนุมัติ"
        backHref="/control/approvals"
        breadcrumbs={[
          { label: "Control plane" },
          { label: "Approvals", href: "/control/approvals" },
          { label: id ?? "รายละเอียด" },
        ]}
      />
      <ApprovalDetailView id={id} />
    </>
  );
}
