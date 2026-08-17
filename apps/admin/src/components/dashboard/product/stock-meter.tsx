import { cn } from "@/lib/utils";

interface StockMeterProps {
  count: number;
  label: string;
  status: "in stock" | "low stock" | "out of stock";
}

const barColorMap = {
  "out of stock": "bg-error",
  "low stock": "bg-warning",
  "in stock": "bg-success",
} as const;

// Track = status color at 0.24 opacity (matches MUI LinearProgress track)
const trackColorMap = {
  "out of stock": "bg-error/24",
  "low stock": "bg-warning/24",
  "in stock": "bg-success/24",
} as const;

function getBarWidth(count: number, status: StockMeterProps["status"]): string {
  if (status === "out of stock") return "w-0";
  if (status === "low stock") return "w-2/12";
  // in stock — scale relative to ~100 max
  const pct = Math.min(100, Math.round((count / 100) * 100));
  if (pct >= 80) return "w-full";
  if (pct >= 60) return "w-9/12";
  if (pct >= 40) return "w-7/12";
  if (pct >= 20) return "w-5/12";
  return "w-3/12";
}

export function StockMeter({ count, label, status }: StockMeterProps) {
  const barWidth = getBarWidth(count, status);

  return (
    <div className="w-20">
      {/* Progress bar track (tinted to status color) */}
      <div
        className={cn(
          "mb-1.5 h-1.5 w-full overflow-hidden rounded-full",
          trackColorMap[status],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            barColorMap[status],
            barWidth,
          )}
        />
      </div>
      {/* Label */}
      <p className="whitespace-nowrap text-xs font-medium text-grey-600">
        {label}
      </p>
    </div>
  );
}
