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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { balanceStats } from "@/lib/mock/banking";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

const PERIODS = ["Yearly", "Monthly", "Weekly"];

export function BankingBalanceStats() {
  const { subtitle, legend, categories, series } = balanceStats;
  const [period, setPeriod] = useState("Yearly");

  const chartData = categories.map((cat, i) => {
    const point: Record<string, string | number> = { name: cat };
    series.forEach((s) => {
      point[s.name] = s.data[i] ?? 0;
    });
    return point;
  });

  return (
    <WidgetCard
      title="Balance statistics"
      subtitle={subtitle}
      action={
        <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
          <SelectTrigger className="h-8 rounded-control text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {PERIODS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      {/* Legend chips */}
      <div className="mb-5 flex flex-wrap gap-4">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-sm">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-grey-600">{item.label}</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[11px] font-bold"
              style={{
                backgroundColor: `${item.color}18`,
                color: item.color,
              }}
            >
              {item.change}
            </span>
            <span className="font-bold text-grey-800">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Grouped bar chart */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 260 }}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
            barCategoryGap="30%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(145,158,171,0.2)" vertical={false} />
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
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(145,158,171,0.08)" }}
            />
            {series.map((s) => (
              <Bar
                key={s.name}
                dataKey={s.name}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                maxBarSize={18}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
