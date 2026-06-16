"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORICAL, CHART_AXIS_TICK, CHART_GRID } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";
import type { RegionSeries } from "@/lib/mock/dashboard";

interface StackedBarChartProps {
  categories: string[];
  series: RegionSeries[];
  height?: number;
  /** Render side-by-side grouped bars instead of stacked. */
  grouped?: boolean;
  yDomain?: [number, number];
  yTicks?: number[];
}

export function StackedBarChart({
  categories,
  series,
  height = 320,
  grouped = false,
  yDomain,
  yTicks,
}: StackedBarChartProps) {
  const data = categories.map((cat, i) => {
    const row: Record<string, string | number> = { category: cat };
    for (const s of series) row[s.name] = s.data[i] ?? 0;
    return row;
  });

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barGap={4}>
          <CartesianGrid vertical={false} stroke={CHART_GRID} strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_AXIS_TICK, fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_AXIS_TICK, fontSize: 12 }}
            domain={yDomain}
            ticks={yTicks}
          />
          <Tooltip cursor={{ fill: "rgba(145,158,171,0.08)" }} content={<ChartTooltip />} />
          {series.map((s, i) => (
            <Bar
              key={s.name}
              dataKey={s.name}
              stackId={grouped ? undefined : "a"}
              fill={CATEGORICAL[i % CATEGORICAL.length]}
              radius={grouped || i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={grouped ? 16 : 24}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
