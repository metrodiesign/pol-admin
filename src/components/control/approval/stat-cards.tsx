import type { ApprovalRequest } from "@/types/control/approval";
import { StatCard } from "@/components/control/shared/stat-card";

/** Summary row for the approval queue: pending · approved · rejected. */
export function ApprovalStatCards({ rows }: { rows: ApprovalRequest[] }) {
  const pending = rows.filter((r) => r.status === "pending").length;
  const approved = rows.filter((r) => r.status === "approved").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard label="รออนุมัติ" value={String(pending)} />
      <StatCard label="อนุมัติแล้ว" value={String(approved)} />
      <StatCard label="ปฏิเสธแล้ว" value={String(rejected)} />
    </div>
  );
}
