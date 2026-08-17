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
import { dataActivity } from "@/lib/mock/file";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

const PERIODS = ["Yearly", "Monthly", "Weekly"];

export function FileDataActivity() {
  const { categories, series } = dataActivity;
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [period, setPeriod] = useState("Yearly");

  const chartData = categories.map((cat, i) => {
    const point: Record<string, string | number> = { name: cat };
    series.forEach((s) => {
      point[s.name] = s.data[i] ?? 0;
    });
    return point;
  });

  function toggleSeries(name: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <section className="dashboard-card flex flex-col">
      {/* Header: title + period (top row); legend chips (second row on mobile, same row on desktop) */}
      <header className="px-6 pt-6 pb-0">
        <div className="flex items-center justify-between gap-3">
          <h6 className="text-lg font-semibold text-grey-800">Data activity</h6>
          <div className="flex items-center gap-3">
            {/* Legend toggle chips — hidden on mobile, shown sm+ inline */}
            <div className="hidden items-center gap-3 sm:flex">
              {series.map((s) => {
                const isHidden = hidden.has(s.name);
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => toggleSeries(s.name)}
                    className="flex items-center gap-1.5 text-xs font-medium"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: isHidden ? "#C4CDD5" : s.color }}
                    />
                    <span className={isHidden ? "text-grey-400" : "text-grey-600"}>
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Period selector */}
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
          </div>
        </div>
      </header>

      {/* Chart */}
      <div className="px-6 pt-4 pb-6">
        <div className="h-[322px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 600, height: 300 }}
          >
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }} barSize={36}>
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
                domain={[0, 400]}
                ticks={[0, 100, 200, 300, 400]}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(145,158,171,0.08)" }}
              />
              {series.map((s, idx) => (
                <Bar
                  key={s.name}
                  dataKey={s.name}
                  fill={s.color}
                  radius={idx === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  stackId="stack"
                  isAnimationActive={false}
                  hide={hidden.has(s.name)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
