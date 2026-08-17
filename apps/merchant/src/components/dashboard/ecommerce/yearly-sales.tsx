"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WidgetCard } from "../widget-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { yearlySales } from "@/lib/mock/ecommerce";

const YEARS = ["2021", "2022", "2023"] as const;

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number; color?: string }[];
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-grey-800/90 px-3 py-2 text-xs text-white shadow-z8">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function YearlySales() {
  const [year, setYear] = useState<string>("2023");
  const { categories, series, totals, change } = yearlySales;

  const chartData = categories.map((cat, i) => {
    const point: Record<string, string | number> = { name: cat };
    series.forEach((s) => {
      point[s.name] = s.data[i] ?? 0;
    });
    return point;
  });

  return (
    <WidgetCard
      title="Yearly sales"
      subtitle={change}
      action={
        <Select value={year} onValueChange={(v) => v && setYear(v)}>
          <SelectTrigger className="h-8 w-[88px] rounded-control text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {YEARS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      {/* Legend row */}
      <div className="mb-2 flex flex-wrap items-center gap-x-6 gap-y-2">
        {totals.map((t) => {
          const s = series.find((se) => se.name === t.name);
          return (
            <div key={t.name} className="flex items-center gap-1.5 text-sm">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: s?.color }}
              />
              <span className="text-grey-500">{t.name}</span>
              <span className="font-semibold text-grey-800">{t.value}</span>
            </div>
          );
        })}
      </div>

      <div className="h-[280px] pt-2">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 600, height: 280 }}
        >
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
          >
            <defs>
              {series.map((s) => {
                const gradId = `grad-ys-${s.name.replace(/\s+/g, "-")}`;
                return (
                  <linearGradient
                    key={s.name}
                    id={gradId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={s.color}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={s.color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(145,158,171,0.2)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#919EAB" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#919EAB" }}
              domain={[0, 250]}
              ticks={[0, 50, 100, 150, 200, 250]}
            />
            <Tooltip content={<ChartTooltip />} />
            {series.map((s) => {
              const gradId = `grad-ys-${s.name.replace(/\s+/g, "-")}`;
              return (
                <Area
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#${gradId})`}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
