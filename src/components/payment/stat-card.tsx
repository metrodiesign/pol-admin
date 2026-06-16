import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, color = "#0c68e9", width = 96, height = 32 }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts: [number, number][] = data.map((v, i) => [
    i * step,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);
  const d = pts
    .map(([x, y], i) => (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1))
    .join(" ");
  const dFill = d + ` L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden
    >
      <path d={dFill} fill={color} opacity="0.12" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  direction: "up" | "down";
  sparkData: number[];
  sub?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// StatCardIcon — icon-badge KPI card (shared across all payment sub-pages)
// ---------------------------------------------------------------------------

export type StatCardTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

const TONE_CLASSES: Record<StatCardTone, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-success/10", text: "text-success-dark" },
  warning: { bg: "bg-warning/10", text: "text-warning-dark" },
  danger:  { bg: "bg-error/10",   text: "text-error-dark" },
  info:    { bg: "bg-info/10",    text: "text-info-dark" },
  neutral: { bg: "bg-grey-500/10", text: "text-grey-600" },
};

export interface StatCardIconProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: StatCardTone;
  className?: string;
}

export function StatCardIcon({
  icon: Icon,
  label,
  value,
  sub,
  tone = "primary",
  className,
}: StatCardIconProps) {
  const t = TONE_CLASSES[tone];
  return (
    <div
      className={cn(
        "rounded-[16px] bg-bg-paper p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[11px]",
            t.bg,
            t.text,
          )}
        >
          <Icon className="size-[22px]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-grey-600">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-xs text-grey-500">{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard — sparkline variant (existing, unchanged)
// ---------------------------------------------------------------------------

export function StatCard({
  label,
  value,
  delta,
  direction,
  sparkData,
  sub,
  className,
}: StatCardProps) {
  const isPositive = direction === "up";
  const deltaColor = isPositive ? "text-success-dark" : "text-error-dark";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const sparkColor = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(145,158,171,0.12)] bg-bg-paper p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-grey-600">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <div className={cn("mt-1 flex items-center gap-1 text-xs font-semibold", deltaColor)}>
            <TrendIcon className="size-3.5 shrink-0" />
            <span>{delta}</span>
          </div>
          {sub && <p className="mt-1 text-xs text-grey-500">{sub}</p>}
        </div>
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  );
}
