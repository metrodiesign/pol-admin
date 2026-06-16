"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { WidgetCard } from "../widget-card";
import { currentSubject } from "@/lib/mock/analytics";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

export function AnalyticsCurrentSubject() {
  const { categories, series } = currentSubject;

  const chartData = categories.map((cat, i) => {
    const point: Record<string, string | number> = { subject: cat };
    series.forEach((s) => {
      point[s.name] = s.data[i] ?? 0;
    });
    return point;
  });

  return (
    <WidgetCard title="Current subject">
      <div className="h-[260px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 300, height: 260 }}
        >
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
            <PolarGrid stroke="rgba(145,158,171,0.2)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "#637381" }}
            />
            <Tooltip content={<ChartTooltip />} />
            {series.map((s) => (
              <Radar
                key={s.name}
                name={s.name}
                dataKey={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.3}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend below the chart */}
      <div className="mt-4 flex items-center justify-center gap-5">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-grey-600">{s.name}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
