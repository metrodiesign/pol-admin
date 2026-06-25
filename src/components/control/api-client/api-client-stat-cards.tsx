import type { ApiClient } from "@/types/api-client";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-sm font-semibold text-grey-600">{label}</p>
      <p className="mt-2 text-[28px] font-bold text-foreground md:text-[32px]">
        {value}
      </p>
    </div>
  );
}

/** Summary row for API clients: total · active · revoked. */
export function ApiClientStatCards({ rows }: { rows: ApiClient[] }) {
  const active = rows.filter((r) => r.status === "active").length;
  const revoked = rows.filter((r) => r.status === "revoked").length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard label="Client ทั้งหมด" value={String(rows.length)} />
      <StatCard label="ใช้งาน" value={String(active)} />
      <StatCard label="เพิกถอนแล้ว" value={String(revoked)} />
    </div>
  );
}
