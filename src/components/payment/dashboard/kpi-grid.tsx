import { StatCard } from "@/components/payment/stat-card";
import type { KpiData } from "@/lib/mock/dashboard-centropay";

interface KpiGridProps {
  kpis: KpiData[];
}

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => (
        <StatCard
          key={k.label}
          label={k.label}
          value={k.value}
          delta={k.delta}
          direction={k.direction}
          sparkData={k.sparkData}
          sub={k.sub}
        />
      ))}
    </div>
  );
}
