import { AuditDetailView } from "@/components/control/audit/detail-view";

export const metadata = {
  title: "รายละเอียด Audit Log | POL Admin",
};

export default async function AuditReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <AuditDetailView id={id} />;
}
