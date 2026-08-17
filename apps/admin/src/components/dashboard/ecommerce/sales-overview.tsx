import { WidgetCard } from "../widget-card";
import { salesOverview } from "@/lib/mock/ecommerce";

function ProgressBar({
  label,
  value,
  percent,
  progress,
  color,
}: {
  label: string;
  value: string;
  percent: string;
  progress: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color }}>
          {label}
        </span>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-grey-800">{value}</span>
          <span className="min-w-[52px] text-right text-grey-500">
            ({percent})
          </span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-grey-500/16">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function SalesOverview() {
  return (
    <WidgetCard title="Sales overview" className="min-h-[294px]">
      <div className="space-y-6">
        {salesOverview.map((item) => (
          <ProgressBar key={item.label} {...item} />
        ))}
      </div>
    </WidgetCard>
  );
}
