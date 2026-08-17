"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { analyticsStats, COLOR_MAP, type AnalyticsStat } from "@/lib/mock/analytics";
import { cn } from "@/lib/utils";

// Sparkline series per card (approximate wave shapes from the reference)
const SPARKLINE_DATA: Record<string, number[]> = {
  "Weekly sales":     [5, 18, 12, 30, 14, 28, 22, 40, 24, 36],
  "New users":        [30, 25, 35, 18, 40, 22, 28, 15, 32, 20],
  "Purchase orders":  [10, 22, 16, 35, 18, 30, 25, 40, 28, 38],
  "Messages":         [20, 35, 18, 42, 25, 38, 20, 45, 28, 40],
};

// SVG glass icon paths approximating the minimals.cc glass icons
// Each uses a layered approach: colored base + lighter fill layer + white specular highlight
function GlassIcon({
  type,
  color,
}: {
  type: string;
  color: string;
}) {
  const iconId = type.replace(/[^a-z0-9]/g, "-");
  if (type === "shopping-bag") {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`shadow-${iconId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={color} floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Bag body */}
        <rect x="7" y="13" width="26" height="22" rx="4" fill={color} fillOpacity="0.9" filter={`url(#shadow-${iconId})`} />
        {/* Handle */}
        <path d="M15 13V11C15 8.239 17.239 6 20 6C22.761 6 25 8.239 25 11V13" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* Glass highlight top of bag */}
        <rect x="7" y="13" width="26" height="10" rx="4" fill="white" fillOpacity="0.28" />
        {/* Handle highlight */}
        <path d="M15 13V11C15 8.239 17.239 6 20 6" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "users") {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`shadow-${iconId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={color} floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Background user (slightly offset, lower opacity) */}
        <circle cx="26" cy="15" r="5" fill={color} fillOpacity="0.48" />
        <path d="M20 32C20 26.477 24.477 22 30 22C33.866 22 37 25.134 37 29H20" fill={color} fillOpacity="0.36" />
        {/* Foreground user */}
        <circle cx="16" cy="15" r="6" fill={color} fillOpacity="0.9" filter={`url(#shadow-${iconId})`} />
        <path d="M4 32C4 25.373 9.373 20 16 20C22.627 20 28 25.373 28 32H4Z" fill={color} fillOpacity="0.8" />
        {/* Glass highlight on primary avatar */}
        <ellipse cx="14" cy="12" rx="3.5" ry="2" fill="white" fillOpacity="0.35" />
        {/* Glass highlight on body */}
        <path d="M4 32C4 25.373 9.373 20 16 20L24 20C24 20 20 24 16 24C12 24 6 28 4 32Z" fill="white" fillOpacity="0.14" />
      </svg>
    );
  }
  if (type === "file-text") {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`shadow-${iconId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={color} floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Document back */}
        <rect x="10" y="6" width="22" height="28" rx="3" fill={color} fillOpacity="0.56" />
        {/* Folded corner */}
        <path d="M24 6L32 14H27C25.343 14 24 12.657 24 11V6Z" fill={color} fillOpacity="0.9" />
        {/* Document front with glass highlight */}
        <rect x="7" y="8" width="22" height="28" rx="3" fill={color} fillOpacity="0.9" filter={`url(#shadow-${iconId})`} />
        <path d="M21 8L29 16H24C22.343 16 21 14.657 21 13V8Z" fill={color} fillOpacity="0.64" />
        {/* Glass highlight on document */}
        <rect x="7" y="8" width="22" height="9" rx="3" fill="white" fillOpacity="0.28" />
        {/* Text lines */}
        <rect x="11" y="22" width="12" height="2" rx="1" fill="white" fillOpacity="0.72" />
        <rect x="11" y="26" width="9" height="2" rx="1" fill="white" fillOpacity="0.48" />
        <rect x="11" y="30" width="14" height="2" rx="1" fill="white" fillOpacity="0.32" />
      </svg>
    );
  }
  // mail
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={`shadow-${iconId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={color} floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Envelope body */}
      <rect x="4" y="10" width="32" height="22" rx="4" fill={color} fillOpacity="0.9" filter={`url(#shadow-${iconId})`} />
      {/* Envelope flap crease (V shape) */}
      <path d="M4 14L20 23L36 14" fill={color} fillOpacity="0.72" />
      {/* Glass highlight top half */}
      <rect x="4" y="10" width="32" height="11" rx="4" fill="white" fillOpacity="0.28" />
      {/* V-line over highlight */}
      <path d="M4 14L20 23L36 14" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function SummarySparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((value, i) => ({ i, value }));
  return (
    <div className="h-14 w-24">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 96, height: 56 }}
      >
        <AreaChart
          data={chartData}
          margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
        >
          <defs>
            <linearGradient id={`spark-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-grad-${color.replace("#", "")})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnalyticsCard({ stat }: { stat: AnalyticsStat }) {
  const TrendIcon = stat.trend.up ? TrendingUp : TrendingDown;
  const colors = COLOR_MAP[stat.colorScheme];
  const sparkData = SPARKLINE_DATA[stat.title] ?? [10, 20, 15, 25];

  return (
    <div
      className="dashboard-card relative flex min-h-[186px] flex-col justify-between overflow-hidden p-6"
      style={{
        background: `linear-gradient(135deg, ${colors.gradFrom} 0%, ${colors.gradTo} 100%)`,
        color: colors.text,
      }}
    >
      {/* Top row: icon + trend badge */}
      <div className="flex items-start justify-between">
        <GlassIcon type={stat.icon} color={colors.icon} />
        <div
          className={cn(
            "flex items-center gap-0.5 text-xs font-semibold",
            stat.trend.up ? "text-success-dark" : "text-error-dark",
          )}
        >
          <TrendIcon className="size-3.5" />
          {stat.trend.up ? "+" : "-"}
          {stat.trend.value}%
        </div>
      </div>

      {/* Bottom row: metric + sparkline */}
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ opacity: 0.72 }}>{stat.title}</p>
          <p className="mt-0.5 text-2xl font-bold" style={{ color: colors.text }}>
            {stat.total}
          </p>
        </div>
        <SummarySparkline data={sparkData} color={colors.icon} />
      </div>
    </div>
  );
}

export function AnalyticsSummary() {
  return (
    <>
      {analyticsStats.map((stat) => (
        <div key={stat.title} className="col-span-12 sm:col-span-6 mmd:col-span-3">
          <AnalyticsCard stat={stat} />
        </div>
      ))}
    </>
  );
}
