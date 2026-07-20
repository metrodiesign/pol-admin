import type { PspConnection } from "@/types/psp-connection";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-sm font-semibold text-grey-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
        {value}
      </p>
    </div>
  );
}

/** Summary row for PSP connections: total · healthy · degraded/error · offline. */
export function PspStatCards({ rows }: { rows: PspConnection[] }) {
  const healthy = rows.filter((r) => r.health === "healthy").length;
  const unhealthy = rows.filter(
    (r) => r.health === "degraded" || r.health === "error",
  ).length;
  const offline = rows.filter((r) => r.health === "offline").length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="การเชื่อมต่อทั้งหมด" value={String(rows.length)} />
      <StatCard label="เชื่อมต่อปกติ" value={String(healthy)} />
      <StatCard label="ต้องตรวจสอบ" value={String(unhealthy)} />
      <StatCard label="ปิดใช้งาน" value={String(offline)} />
    </div>
  );
}
