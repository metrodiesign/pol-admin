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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bookingStatistics } from "@/lib/mock/booking";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

const PERIODS = ["Yearly", "Monthly", "Weekly"];

export function BookingStatistics() {
  const [period, setPeriod] = useState("Yearly");
  const { legend, categories, series } = bookingStatistics;

  const chartData = categories.map((cat, i) => {
    const point: Record<string, string | number> = { name: cat };
    series.forEach((s) => {
      point[s.name] = s.data[i] ?? 0;
    });
    return point;
  });

  return (
    <div className="dashboard-card flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 p-6 pb-0">
        <div>
          <h6 className="text-lg font-semibold text-grey-800">Statistics</h6>
          {/* Legend chips */}
          <div className="mt-2 flex items-center gap-4">
            {legend.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-sm">
                <span className="size-3 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-grey-600">{l.label}</span>
                <span className="font-bold text-grey-800">{l.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Period selector */}
        <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
          <SelectTrigger className="h-8 shrink-0 rounded-control text-sm">
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
      </div>

      <div className="p-6 pt-4 flex-1">
        <div className="h-[280px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 600, height: 280 }}
          >
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }} barGap={4}>
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
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
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
                  barSize={16}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
