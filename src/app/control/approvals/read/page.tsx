import { ApprovalDetailView } from "@/components/control/approval/detail-view";

export const metadata = {
  title: "รายละเอียดคำขออนุมัติ | POL Admin",
};

export default async function ApprovalReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <ApprovalDetailView id={id} />;
}
