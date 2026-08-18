"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { toursAvailable } from "@/lib/mock/booking";

export function BookingToursAvailable() {
  const soldPct = (toursAvailable.sold / toursAvailable.total) * 100;
  const availPct = (toursAvailable.available / toursAvailable.total) * 100;

  // Semi-circle: startAngle=180, endAngle=0 draws the top half (left → right)
  const data = [
    { name: "Sold out", value: soldPct, color: "#00A76F" },
    { name: "Available", value: availPct, color: "rgba(145,158,171,0.16)" },
  ];

  // Chart container: full width but only half height so the semi-circle fills it
  // cy="100%" pushes the center to the bottom edge; the arc draws upward
  const CHART_W = 240;
  const CHART_H = 140;

  return (
    <div className="dashboard-card flex flex-col p-6 h-full">
      <h6 className="text-lg font-semibold text-grey-800">Tours available</h6>

      <div className="flex flex-col items-center mt-6 flex-1 justify-center">
        {/* Semi-circle gauge */}
        <div className="relative" style={{ width: CHART_W, height: CHART_H }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: CHART_W, height: CHART_H }}
          >
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="100%"
                innerRadius={80}
                outerRadius={110}
                startAngle={180}
                endAngle={0}
                stroke="none"
                isAnimationActive={false}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label — sits at the arc midpoint */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{ bottom: 8 }}
          >
            <span className="text-xs text-grey-500">Tours</span>
            <span
              className="font-bold text-grey-800"
              style={{ fontFamily: "var(--font-barlow, 'Barlow', sans-serif)", fontSize: "1.75rem", lineHeight: 1.1 }}
            >
              {toursAvailable.total}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 w-full space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-primary inline-block" />
              <span className="text-grey-600">Sold out</span>
            </div>
            <span className="font-semibold text-grey-800">{toursAvailable.sold} tours</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-grey-300 inline-block" />
              <span className="text-grey-600">Available</span>
            </div>
            <span className="font-semibold text-grey-800">{toursAvailable.available} tours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
