"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { WidgetCard } from "../widget-card";
import { expensesCategories, expensesSummary } from "@/lib/mock/banking";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

/**
 * PolarArea chart approximation using recharts:
 * Each segment occupies an equal angular slice (360/n degrees) but the
 * outer radius is proportional to the segment's value — matching the live
 * minimals.cc PolarArea chart where radius encodes magnitude.
 */
function PolarAreaChart() {
  const total = expensesCategories.length;
  const sliceDeg = 360 / total;

  const maxValue = Math.max(...expensesCategories.map((c) => c.value));
  const minRadius = 30; // % — minimum outer radius for lowest value
  const maxRadius = 92; // % — maximum outer radius for highest value

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      initialDimension={{ width: 200, height: 200 }}
    >
      <PieChart>
        <Tooltip content={<ChartTooltip hideLabel valueFormatter={(v) => `$${Number(v).toLocaleString()}`} />} />
        {expensesCategories.map((cat, i) => {
          const startAngle = 90 - i * sliceDeg;
          const endAngle = startAngle - sliceDeg;
          // Scale outer radius proportionally to value
          const scaledR = minRadius + (cat.value / maxValue) * (maxRadius - minRadius);
          const outerR = `${scaledR.toFixed(1)}%`;
          const innerR = "18%";

          return (
            <Pie
              key={cat.label}
              data={[cat]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              startAngle={startAngle}
              endAngle={endAngle}
              outerRadius={outerR}
              innerRadius={innerR}
              stroke="white"
              strokeWidth={2}
              isAnimationActive={false}
            >
              <Cell fill={cat.color} />
            </Pie>
          );
        })}
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BankingExpenses() {
  return (
    <WidgetCard title="Expenses categories">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Polar area chart */}
        <div className="mx-auto aspect-square w-[220px] shrink-0 lg:mx-0">
          <PolarAreaChart />
        </div>

        {/* Legend + footer */}
        <div className="flex-1">
          {/* 2-column legend grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {expensesCategories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-1.5 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-grey-700">
                  {cat.label}{" "}
                  <span className="font-semibold text-grey-800">(${cat.value})</span>
                </span>
              </div>
            ))}
          </div>

          {/* Footer stats */}
          <div className="mt-6 flex gap-10 border-t border-dashed border-grey-300 pt-5">
            <div>
              <p className="text-sm font-semibold leading-[22px] text-grey-800">Categories</p>
              <p className="mt-1 text-2xl font-bold text-grey-800">
                {expensesSummary.categories}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold leading-[22px] text-grey-800">Categories</p>
              <p className="mt-1 text-2xl font-bold text-grey-800">{expensesSummary.total}</p>
            </div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
