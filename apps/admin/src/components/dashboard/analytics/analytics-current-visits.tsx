"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { WidgetCard } from "../widget-card";
import { currentVisits } from "@/lib/mock/analytics";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

const TOTAL_VISITS = currentVisits.reduce((sum, d) => sum + d.value, 0);

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  value?: number;
}

// Light-colored slices need dark text; dark slices use white
const LIGHT_SLICE_COLORS = new Set(["#FFD666"]); // Asia yellow is light

function SlicePercentLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  percent,
  value,
}: LabelProps) {
  // compute percent from raw value if recharts doesn't supply it reliably
  const pct =
    percent != null && !isNaN(percent)
      ? percent
      : value != null && TOTAL_VISITS > 0
        ? value / TOTAL_VISITS
        : 0;
  if (pct < 0.04) return null; // skip very tiny slices
  const RADIAN = Math.PI / 180;
  // Position label outside the pie so it's always readable
  const radius = outerRadius * 0.68;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  // Determine which slice this is by value to pick text color
  const matchedSlice = currentVisits.find(
    (s) => TOTAL_VISITS > 0 && Math.abs(s.value / TOTAL_VISITS - pct) < 0.01,
  );
  const fillColor =
    matchedSlice && LIGHT_SLICE_COLORS.has(matchedSlice.color)
      ? "#212B36"
      : "white";
  return (
    <text
      x={x}
      y={y}
      fill={fillColor}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(pct * 100).toFixed(1)}%`}
    </text>
  );
}

export function AnalyticsCurrentVisits() {
  return (
    <WidgetCard title="Current visits">
      <div className="flex flex-col items-center gap-6 pt-2">
        <div className="relative mx-auto aspect-square w-[220px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 220, height: 220 }}
          >
            <PieChart>
              <Tooltip content={<ChartTooltip hideLabel />} />
              <Pie
                data={currentVisits}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius="88%"
                paddingAngle={2}
                cornerRadius={4}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
                labelLine={false}
                label={SlicePercentLabel}
              >
                {currentVisits.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {currentVisits.map((entry) => (
            <div
              key={entry.label}
              className="flex items-center gap-1.5 text-sm text-grey-700"
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
