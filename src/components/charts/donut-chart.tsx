"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORICAL } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";
import { ChartLegend } from "./chart-legend";
import type { DownloadSlice } from "@/lib/mock/dashboard";

interface DonutChartProps {
  data: DownloadSlice[];
  total: string;
  totalLabel?: string;
  colors?: string[];
}

export function DonutChart({
  data,
  total,
  totalLabel = "Total",
  colors = CATEGORICAL,
}: DonutChartProps) {
  return (
    <div className="relative mx-auto aspect-square w-[260px]">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 260, height: 260 }}>
        <PieChart>
          <Tooltip content={<ChartTooltip hideLabel />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={2}
            cornerRadius={6}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={entry.label} fill={colors[i % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold text-grey-800">{totalLabel}</span>
        <span className="text-xl font-bold text-grey-800">{total}</span>
      </div>
    </div>
  );
}

interface LegendProps {
  data: DownloadSlice[];
  colors?: string[];
}

export function DonutLegend({ data, colors = CATEGORICAL }: LegendProps) {
  return (
    <ChartLegend
      items={data.map((entry, i) => ({
        label: entry.label,
        color: colors[i % colors.length] ?? colors[0] ?? "#00a76f",
      }))}
    />
  );
}
