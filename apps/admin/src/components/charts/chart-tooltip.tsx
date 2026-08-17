"use client";

import type { ReactNode } from "react";

interface ChartTooltipItem {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { fill?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: ReactNode;
  hideLabel?: boolean;
  valueFormatter?: (v: number | string) => string;
}

/**
 * Shared chart tooltip — minimals paper style: bg-card @90% + blur + dropdown
 * shadow, grey-200 title, color dot + name + value. Mode-aware (bg-card flips).
 * Pass to recharts via `content={<ChartTooltip />}`; recharts injects
 * active/payload/label and preserves hideLabel/valueFormatter.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  hideLabel,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const fmt =
    valueFormatter ??
    ((v: number | string) =>
      typeof v === "number" ? v.toLocaleString() : String(v));

  const showLabel = !hideLabel && label !== undefined && label !== null && label !== "";

  return (
    <div className="overflow-hidden rounded-[10px] bg-card/90 shadow-[var(--shadow-dropdown)] backdrop-blur-[6px]">
      {showLabel ? (
        <div className="bg-grey-200 px-2 py-1.5 text-xs font-bold text-grey-600">
          {label}
        </div>
      ) : null}
      <div className="space-y-1 px-2 py-1.5">
        {payload.map((item, i) => {
          const color = item.color ?? item.payload?.fill;
          return (
            <div
              key={item.name ?? i}
              className="flex items-center gap-1.5 text-xs text-foreground"
            >
              {color ? (
                <span
                  className="size-2 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: color }}
                />
              ) : null}
              {item.name ? (
                <span className="text-grey-600">{item.name}</span>
              ) : null}
              <span className="ml-auto font-semibold tabular-nums">
                {item.value !== undefined && item.value !== null
                  ? fmt(item.value)
                  : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
