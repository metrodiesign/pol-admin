import type { ApiClient } from "@/types/control/api-client";
import { StatCard } from "@/components/control/shared/stat-card";

/** Summary row for API clients: total · active · revoked. */
export function ApiClientStatCards({ rows }: { rows: ApiClient[] }) {
  const active = rows.filter((r) => r.status === "active").length;
  const revoked = rows.filter((r) => r.status === "revoked").length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard label="ไคลเอนต์ทั้งหมด" value={String(rows.length)} />
      <StatCard label="ใช้งาน" value={String(active)} />
      <StatCard label="เพิกถอนแล้ว" value={String(revoked)} />
    </div>
  );
}
