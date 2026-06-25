import type { PspConnection } from "@/types/psp-connection";

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

/** Summary row for PSP connections: total · live · test · degraded/error. */
export function PspStatCards({ rows }: { rows: PspConnection[] }) {
  const live = rows.filter((r) => r.environment === "live").length;
  const test = rows.filter((r) => r.environment === "test").length;
  const unhealthy = rows.filter(
    (r) => r.health === "degraded" || r.health === "error",
  ).length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="การเชื่อมต่อทั้งหมด" value={String(rows.length)} />
      <StatCard label="Live" value={String(live)} />
      <StatCard label="Test" value={String(test)} />
      <StatCard label="ต้องตรวจสอบ" value={String(unhealthy)} />
    </div>
  );
}
