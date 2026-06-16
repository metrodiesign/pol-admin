"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { WidgetCard } from "@/components/dashboard/widget-card";
import type { PspSlice } from "@/lib/mock/dashboard-centropay";

interface SliceTooltipPayload {
  name?: string;
  value?: number;
  payload?: { fill?: string };
}

function PspTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: SliceTooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="rounded-lg bg-grey-800/90 px-3 py-1.5 text-xs text-white shadow-z8">
      <span className="flex items-center gap-1.5">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: item.payload?.fill }}
        />
        {item.name}: {item.value}%
      </span>
    </div>
  );
}

function fmtInt(n: number) {
  return n.toLocaleString("th-TH");
}

interface PspDonutProps {
  data: PspSlice[];
  totalTxn: number;
}

export function PspDonut({ data, totalTxn }: PspDonutProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const pieData = data.map((d) => ({
    name: d.psp,
    value: d.share,
    fill: d.color,
  }));

  const centerLabel = hovered !== null ? (data[hovered]?.psp ?? "PSP") : "ธุรกรรมวันนี้";
  const centerValue =
    hovered !== null
      ? `${data[hovered]?.share ?? 0}%`
      : fmtInt(totalTxn);

  return (
    <WidgetCard title="สัดส่วน PSP" subtitle="ธุรกรรมวันนี้">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 180, height: 180 }}
          >
            <PieChart>
              <Tooltip content={<PspTooltip />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, index) => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {pieData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.fill}
                    opacity={hovered !== null && hovered !== i ? 0.45 : 1}
                    style={{ cursor: "pointer", transition: "opacity 150ms" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-grey-600">{centerLabel}</span>
            <span className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
              {centerValue}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-4">
          {data.map((d, i) => (
            <div
              key={d.psp}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                opacity: hovered !== null && hovered !== i ? 0.45 : 1,
                transition: "opacity 150ms",
                cursor: "pointer",
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="size-2.5 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm font-semibold">{d.psp}</span>
                <span className="ml-auto text-sm font-bold tabular-nums">
                  {d.share}%
                </span>
              </div>
              <p className="text-xs text-grey-600">
                {fmtInt(d.txn)} รายการ · ฿{(d.volume / 1e6).toFixed(2)}M
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-grey-200">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${d.share}%`, backgroundColor: d.color }}
                />
              </div>
            </div>
          ))}
          <p className="rounded-control border border-[rgba(145,158,171,0.2)] bg-grey-100 px-3 py-2 text-xs text-grey-600 leading-snug">
            กำลังกระจายธุรกรรมตาม 4 กฎ routing ที่กำหนด
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}
