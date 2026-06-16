"use client";

import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { WidgetCard } from "../widget-card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { saleByGender } from "@/lib/mock/ecommerce";

export function SaleByGender() {
  const { total, data } = saleByGender;

  // RadialBarChart needs value as a percentage of domain max for display.
  // We show 3 concentric tracks, each track is one category.
  const max = data[0]?.value ?? 1;
  const chartData = data.map((d) => ({
    name: d.label,
    value: Math.round((d.value / max) * 100),
    fill: d.color,
  }));

  return (
    <WidgetCard title="Sale by gender">
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="relative mx-auto" style={{ width: 260, height: 260 }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 260, height: 260 }}
          >
            <RadialBarChart
              data={chartData}
              innerRadius="28%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              barSize={14}
              barCategoryGap={8}
            >
              <Tooltip content={<ChartTooltip hideLabel />} />
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: "rgba(145,158,171,0.12)" }}
                isAnimationActive={false}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-grey-500">Total</span>
            <span className="text-2xl font-bold text-grey-800">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          {data.map((entry) => (
            <div
              key={entry.label}
              className="flex items-center gap-1.5 text-sm text-grey-600"
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.label}
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}
