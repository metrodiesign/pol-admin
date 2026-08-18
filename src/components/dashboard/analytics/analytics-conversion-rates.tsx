"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WidgetCard } from "../widget-card";
import { conversionRates } from "@/lib/mock/analytics";
import { cn } from "@/lib/utils";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

export function AnalyticsConversionRates() {
  const { categories, series, change } = conversionRates;

  // hidden set: series names that are toggled off
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const chartData = categories.map((cat, i) => {
    const point: Record<string, string | number> = { name: cat };
    series.forEach((s) => {
      point[s.name] = s.data[i] ?? 0;
    });
    return point;
  });

  const visibleSeries = series.filter((s) => !hidden.has(s.name));

  return (
    <WidgetCard
      title="Conversion rates"
      subtitle={change}
      action={
        <div className="flex items-center gap-2">
          {series.map((s) => {
            const isHidden = hidden.has(s.name);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => toggle(s.name)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-opacity",
                  isHidden
                    ? "border-grey-300 bg-transparent text-grey-400 opacity-50"
                    : "border-transparent bg-grey-100 text-grey-700",
                )}
                aria-pressed={!isHidden}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: isHidden ? "#c4cdd5" : s.color,
                  }}
                />
                {s.name}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="h-[300px] pt-2">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 600, height: 300 }}
        >
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(145,158,171,0.2)"
              horizontal={false}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#919EAB" }}
              domain={[0, 80]}
              ticks={[0, 20, 40, 60, 80]}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#919EAB" }}
              width={48}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(145,158,171,0.08)" }}
            />
            {visibleSeries.map((s) => (
              <Bar
                key={s.name}
                dataKey={s.name}
                fill={s.color}
                radius={[0, 4, 4, 0]}
                barSize={12}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
