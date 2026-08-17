"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { bookedItems, conversionStats } from "@/lib/mock/booking";

function RadialGauge({
  percentage,
  color,
  total,
  label,
}: {
  percentage: number;
  color: string;
  total: string;
  label: string;
}) {
  const data = [
    { value: percentage, fill: color },
    { value: 100 - percentage, fill: "rgba(145,158,171,0.16)" },
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Circular gauge — increased to 88px for visual prominence */}
      <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 88, height: 88 }}
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="68%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center percentage text */}
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-bold leading-none"
          style={{ color }}
        >
          {percentage}%
        </span>
      </div>

      {/* Label */}
      <div className="min-w-0">
        <p className="text-sm font-bold text-grey-800">{total}</p>
        <p className="text-xs text-grey-500 leading-tight max-w-[90px]">{label}</p>
      </div>
    </div>
  );
}

export function BookingBooked() {
  return (
    <div className="dashboard-card flex flex-col p-6 h-full">
      <h6 className="text-lg font-semibold text-grey-800">Booked</h6>

      {/* Progress bars */}
      <div className="mt-4 space-y-3">
        {bookedItems.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-grey-500">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-grey-800">{item.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-grey-500/16">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.progress}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Two radial gauges */}
      <div className="mt-6 flex gap-4">
        {conversionStats.map((stat) => (
          <RadialGauge
            key={stat.label}
            percentage={parseFloat(stat.value)}
            color={stat.color}
            total={stat.total}
            label={stat.label}
          />
        ))}
      </div>
    </div>
  );
}
