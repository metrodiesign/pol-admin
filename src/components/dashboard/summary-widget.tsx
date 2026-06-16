import { ArrowUp, ArrowDown } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import { summaryStats, type SummaryStat } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

function SummaryCard({ stat }: { stat: SummaryStat }) {
  const TrendIcon = stat.trend.up ? ArrowUp : ArrowDown;
  return (
    <div className="dashboard-card flex items-start justify-between gap-4 p-6">
      <div>
        <p className="text-sm font-semibold leading-[22px] text-grey-800">{stat.title}</p>
        <p
          className="mt-3 text-[32px] font-bold leading-[48px] text-grey-800"
          style={{ fontFamily: "var(--font-barlow, 'Barlow', 'Public Sans Variable', sans-serif)" }}
        >
          {stat.total}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <TrendIcon className={cn("size-4", stat.trend.up ? "text-success" : "text-error")} />
          <span className="font-semibold text-grey-800">
            {stat.trend.up ? "+" : "-"}
            {stat.trend.value}%
          </span>
          <span className="text-grey-600">last 7 days</span>
        </div>
      </div>
      <Sparkline data={stat.series} color={stat.color} variant="bar" width={64} height={56} />
    </div>
  );
}

export function SummaryWidgets() {
  return (
    <>
      {summaryStats.map((stat) => (
        <div key={stat.title} className="mmd:col-span-4">
          <SummaryCard stat={stat} />
        </div>
      ))}
    </>
  );
}
