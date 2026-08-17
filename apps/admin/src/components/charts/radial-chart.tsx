"use client";

import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { ACCENT_HEX } from "./chart-colors";
import type { AccentColor } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

interface RadialChartProps {
  value: number;
  color?: AccentColor;
  /** Explicit bar color override (e.g. white on a solid card). */
  barColor?: string;
  trackFill?: string;
  size?: number;
  labelClassName?: string;
}

export function RadialChart({
  value,
  color = "primary",
  barColor,
  trackFill = "rgba(145,158,171,0.16)",
  size = 100,
  labelClassName,
}: RadialChartProps) {
  const hex = barColor ?? ACCENT_HEX[color];
  const data = [{ name: "value", value }];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: size, height: size }}>
        <RadialBarChart
          data={data}
          innerRadius="72%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={8}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={8}
            fill={hex}
            background={{ fill: trackFill }}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className={cn("text-base font-bold text-grey-800", labelClassName)}>{value}%</span>
      </div>
    </div>
  );
}
