import { Sparkline } from "@/components/charts/sparkline";
import { StatCard } from "@/components/control/shared/stat-card";
import type { AccentColor } from "@/lib/mock/dashboard";
import { formatTHB } from "@/lib/utils";

interface Kpi {
  label: string;
  value: string;
  color: AccentColor;
  trend: number[];
}

/** Total volume · count · average ticket — each with a small accent sparkline. */
export function ReportKpiCards({
  volume,
  count,
}: {
  volume: number;
  count: number;
}) {
  const avg = count > 0 ? volume / count : 0;

  const cards: Kpi[] = [
    {
      label: "ปริมาณธุรกรรมรวม",
      value: formatTHB(volume),
      color: "primary",
      trend: [12, 18, 15, 22, 26, 24, 31],
    },
    {
      label: "จำนวนธุรกรรม",
      value: String(count),
      color: "info",
      trend: [8, 11, 9, 14, 13, 17, 19],
    },
    {
      label: "ยอดเฉลี่ยต่อรายการ",
      value: formatTHB(avg),
      color: "warning",
      trend: [20, 19, 23, 21, 25, 22, 24],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {cards.map((c) => (
        <StatCard
          key={c.label}
          label={c.label}
          value={c.value}
          trailing={<Sparkline data={c.trend} color={c.color} width={72} height={48} />}
        />
      ))}
    </div>
  );
}
