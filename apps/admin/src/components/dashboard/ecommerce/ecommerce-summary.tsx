import { ArrowUpward, ArrowDownward } from "@/components/dashboard/ecommerce/trend-icons";
import { Sparkline } from "@/components/charts/sparkline";
import { ecommerceStats, type EcommerceStat } from "@/lib/mock/ecommerce";
import { cn } from "@/lib/utils";

function StatCard({ stat }: { stat: EcommerceStat }) {
  return (
    <div className="dashboard-card flex min-h-[166px] items-start justify-between gap-4 p-6">
      <div>
        <p className="text-sm font-semibold leading-[22px] text-grey-800">{stat.title}</p>
        <p
          className="mt-3 font-bold text-grey-800"
          style={{
            fontFamily: "var(--font-barlow, Barlow, sans-serif)",
            fontSize: "32px",
            lineHeight: "48px",
          }}
        >
          {stat.total}
        </p>
        <div className="mt-2 flex items-center gap-1 text-sm">
          {stat.trend.up ? (
            <ArrowUpward className="size-4 text-success" />
          ) : (
            <ArrowDownward className="size-4 text-error" />
          )}
          <span className={cn("font-semibold", stat.trend.up ? "text-success" : "text-error")}>
            {stat.trend.up ? "+" : "-"}
            {stat.trend.value}%
          </span>
          <span className="text-grey-500">&nbsp;last week</span>
        </div>
      </div>
      <Sparkline data={stat.series} color={stat.color} variant="area" width={100} height={64} />
    </div>
  );
}

export function EcommerceSummary() {
  return (
    <>
      {ecommerceStats.map((stat) => (
        <div key={stat.title} className="mmd:col-span-4">
          <StatCard stat={stat} />
        </div>
      ))}
    </>
  );
}
