"use client";

import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";
import { ACCENT_HEX } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";
import type { AccentColor } from "@/lib/mock/dashboard";

interface SparklineProps {
  data: number[];
  color: AccentColor;
  variant?: "area" | "bar" | "line";
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color,
  variant = "area",
  width = 60,
  height = 36,
}: SparklineProps) {
  const hex = ACCENT_HEX[color];
  const chartData = data.map((value, i) => ({ i, value }));
  const gradientId = `spark-${color}`;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width, height }}>
        {variant === "area" ? (
          <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={hex} stopOpacity={0.16} />
                <stop offset="100%" stopColor={hex} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={<ChartTooltip hideLabel />} cursor={false} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={hex}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        ) : variant === "line" ? (
          <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={hex} stopOpacity={0.24} />
                <stop offset="100%" stopColor={hex} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={<ChartTooltip hideLabel />} cursor={false} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={hex}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <Tooltip content={<ChartTooltip hideLabel />} cursor={false} />
            <Bar dataKey="value" fill={hex} radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
