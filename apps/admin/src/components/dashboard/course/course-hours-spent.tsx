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
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { hoursSpent } from "@/lib/mock/course";

const PERIODS = ["Yearly", "Monthly", "Weekly"];

export function CourseHoursSpent() {
  const [period, setPeriod] = useState("Yearly");

  const chartData = hoursSpent.categories.map((cat, i) => ({
    name: cat,
    value: hoursSpent.data[i],
  }));

  return (
    <WidgetCard
      title="Hours spent"
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
      <div className="h-[290px] pt-2">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 600, height: 290 }}
        >
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="course-hours-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity={0.16} />
                <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity={0.01} />
              </linearGradient>
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
              domain={[0, 100]}
              ticks={[20, 40, 60, 80, 100]}
            />
            <Tooltip
              content={<ChartTooltip valueFormatter={(v) => `${v}h`} />}
              cursor={false}
            />
            <Area
              type="monotone"
              name="Hours spent"
              dataKey="value"
              stroke="var(--color-foreground)"
              strokeWidth={2.5}
              fill="url(#course-hours-grad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
