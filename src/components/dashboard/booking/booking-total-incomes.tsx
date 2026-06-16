"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { totalIncomes } from "@/lib/mock/booking";

export function BookingTotalIncomes() {
  const chartData = totalIncomes.series.map((value, i) => ({ i, value }));

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-card h-full"
      style={{
        backgroundColor: "#065E49",
        boxShadow: "var(--shadow-card)",
        minHeight: "220px",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-0">
        <div>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.72)" }}>
            Total incomes
          </p>
          <p
            className="mt-2 font-bold text-white"
            style={{ fontFamily: "var(--font-barlow, 'Barlow', sans-serif)", fontSize: "2rem" }}
          >
            {totalIncomes.total}
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-white">
          <TrendingUp className="size-4" />
          +{totalIncomes.trend.value}%
        </div>
      </div>
      <p className="px-6 text-xs" style={{ color: "rgba(255,255,255,0.48)" }}>
        {totalIncomes.trendLabel}
      </p>

      {/* Sparkline fills the bottom */}
      <div className="mt-auto h-[100px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 100 }}>
          <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="booking-income-grad-dark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.24)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth={2}
              fill="url(#booking-income-grad-dark)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
