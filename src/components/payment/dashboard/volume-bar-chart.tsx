"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/payment/toast/toast-provider";
import { Download } from "lucide-react";
import type { VolumePeriodData } from "@/lib/mock/dashboard-centropay";

interface TooltipPayload {
  value?: number;
}

function VolumeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg bg-grey-800/90 px-3 py-2 text-xs text-white shadow-z8">
      {label && <p className="mb-1 font-semibold">{label}</p>}
      <p className="tabular-nums font-bold">฿{val.toFixed(2)}M</p>
    </div>
  );
}

type PeriodKey = "30d" | "90d" | "ytd";

interface VolumeBarChartProps {
  periods: Record<PeriodKey, VolumePeriodData>;
}

const PERIOD_LABELS: Record<PeriodKey, string> = {
  "30d": "30 วัน",
  "90d": "90 วัน",
  ytd: "ปีนี้",
};

export function VolumeBarChart({ periods }: VolumeBarChartProps) {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const toast = useToast();
  const pd = periods[period];

  const chartData = pd.values.map((v, i) => ({
    label: pd.labels[i] ?? "",
    value: v,
  }));

  const titleSuffix =
    period === "30d" ? "30 วัน" : period === "90d" ? "90 วัน" : "5 เดือนแรกของปี";

  return (
    <WidgetCard
      title={`มูลค่ารับชำระย้อนหลัง ${titleSuffix}`}
      subtitle="หน่วย: ล้านบาท · รวมทุก PSP และทุกช่องทาง"
      action={
        <div className="flex items-center gap-1.5">
          {(["30d", "90d", "ytd"] as PeriodKey[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-control px-3 py-1 text-xs font-semibold transition-colors",
                period === p
                  ? "bg-primary text-white"
                  : "bg-grey-200 text-grey-600 hover:bg-grey-300",
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
          <button
            onClick={() => {
              toast.success("ส่งออกข้อมูลสำเร็จ", {
                description: `ข้อมูล ${PERIOD_LABELS[period]} ถูกส่งออกแล้ว`,
              });
            }}
            className="rounded-full p-1.5 text-grey-500 hover:bg-grey-200 hover:text-foreground transition-colors"
            aria-label="ส่งออกข้อมูล"
            title="ส่งออกข้อมูล"
          >
            <Download className="size-3.5" />
          </button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div>
          <p className="text-xs text-grey-600">มูลค่ารวม</p>
          <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {pd.total}
          </p>
        </div>
        <div>
          <p className="text-xs text-grey-600">{pd.avgLabel}</p>
          <p className="text-lg font-semibold tabular-nums">{pd.avg}</p>
        </div>
        <div>
          <p className="text-xs text-grey-600">เทียบช่วงก่อนหน้า</p>
          <p className="text-sm font-semibold text-success-dark">▲ {pd.delta}</p>
        </div>
      </div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 600, height: 220 }}
        >
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            barGap={2}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(145,158,171,0.2)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#637381", fontSize: 11 }}
              interval={period === "ytd" ? 0 : period === "90d" ? 9 : 4}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#637381", fontSize: 11 }}
              tickFormatter={(v: number) => `${v}M`}
            />
            <Tooltip
              cursor={{ fill: "rgba(145,158,171,0.08)" }}
              content={<VolumeTooltip />}
            />
            <Bar
              dataKey="value"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={period === "ytd" ? 56 : 14}
              isAnimationActive
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
