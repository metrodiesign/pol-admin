import { ArrowUp, ArrowDown } from "lucide-react";
import { paymentSummaryStats, type PaymentSummaryStat } from "@/lib/mock/main";
import { cn } from "@/lib/utils";

function PaymentSummaryCard({
  stat,
  captionMedium,
}: {
  stat: PaymentSummaryStat;
  captionMedium?: boolean;
}) {
  const TrendIcon = stat.trend.up ? ArrowUp : ArrowDown;
  return (
    <div className="dashboard-card flex h-full items-center gap-3 overflow-hidden p-6">
      <div className="min-w-0">
        <p className="text-base font-semibold leading-[22px] text-grey-800">{stat.title}</p>
        <p
          className="mt-3 text-3xl font-bold leading-[48px] text-grey-800"
          style={{ fontFamily: "var(--font-barlow, 'Barlow', 'Public Sans Variable', sans-serif)" }}
        >
          {stat.total}
        </p>
        <div className="mt-2 flex flex-col items-start gap-1.5 text-sm">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              stat.trend.up ? "bg-success/16 text-success" : "bg-error/16 text-error",
            )}
          >
            <TrendIcon className="size-3.5" />
            {stat.trend.up ? "+" : "-"}
            {stat.trend.value}%
          </span>
          <span className={cn("whitespace-nowrap text-grey-600", captionMedium && "font-medium")}>{stat.caption}</span>
        </div>
      </div>
    </div>
  );
}

export function PaymentSummaryWidgets() {
  return (
    <>
      {paymentSummaryStats.map((stat, i) => (
        <div key={stat.title} className="mmd:col-span-3">
          <PaymentSummaryCard stat={stat} captionMedium={i > 0} />
        </div>
      ))}
    </>
  );
}
