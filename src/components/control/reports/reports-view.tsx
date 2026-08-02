"use client";

import { useMemo, useState } from "react";
import { ControlListToolbar } from "@/components/control/shared/control-list-toolbar";
import { DonutChart, DonutLegend } from "@/components/charts/donut-chart";
import { StackedBarChart } from "@/components/charts/stacked-bar-chart";
import { CATEGORICAL } from "@/components/charts/chart-colors";
import { PAYMENT_SESSIONS } from "@/lib/mock/transactions";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import {
  pspSplit,
  channelSplit,
  topOriginators,
  totalVolume,
  totalCount,
} from "@/lib/control/reports";
import { formatTHB } from "@/lib/utils";
import { ReportKpiCards } from "./report-kpi-cards";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-5 rounded-2xl bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h6 className="text-lg font-semibold text-grey-800">{title}</h6>
      {children}
    </div>
  );
}

export function ReportsView() {
  const [tenant, setTenant] = useState("");
  const [period, setPeriod] = useState("");

  // Mock data has no tenant/period dimension — the filters are visual only.
  const txns = PAYMENT_SESSIONS;

  const psp = useMemo(() => pspSplit(txns), [txns]);
  const channels = useMemo(() => channelSplit(txns), [txns]);
  const originators = useMemo(() => topOriginators(txns), [txns]);
  const volume = totalVolume(txns);
  const count = totalCount(txns);

  const pspData = psp.map((s) => ({ label: s.name, value: s.value }));
  const channelSeries = channels.map((c) => ({ name: c.name, data: [c.value] }));

  return (
    <div className="flex flex-col gap-6">
      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <ControlListToolbar
          search=""
          onSearchChange={() => {}}
          searchPlaceholder=""
          filters={[
            {
              label: "บริษัท",
              value: tenant,
              onChange: setTenant,
              options: Object.entries(MERCHANT_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            },
            {
              label: "ช่วงเวลา",
              value: period,
              onChange: setPeriod,
              options: [
                { value: "today", label: "วันนี้" },
                { value: "7d", label: "7 วันล่าสุด" },
                { value: "30d", label: "30 วันล่าสุด" },
                { value: "mtd", label: "เดือนนี้" },
              ],
            },
          ]}
        />
      </div>

      <ReportKpiCards volume={volume} count={count} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="สัดส่วนตาม PSP">
          <DonutChart
            data={pspData}
            total={formatTHB(volume)}
            totalLabel="ปริมาณรวม"
          />
          <DonutLegend data={pspData} />
        </ChartCard>

        <ChartCard title="สัดส่วนตามช่องทางชำระเงิน">
          <div className="mb-1 flex flex-wrap items-center gap-x-6 gap-y-2">
            {channels.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: CATEGORICAL[i % CATEGORICAL.length] }}
                />
                <span className="text-sm text-grey-600">{c.name}</span>
                <span className="text-sm font-semibold text-grey-800">
                  {formatTHB(c.value)}
                </span>
              </div>
            ))}
          </div>
          <StackedBarChart
            categories={["ช่องทาง"]}
            series={channelSeries}
            grouped
            valueFormatter={(v) =>
              v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`
            }
          />
        </ChartCard>
      </div>

      <ChartCard title="ผู้ส่งงานสูงสุด">
        <ul className="flex flex-col">
          {originators.map((o, i) => (
            <li
              key={o.code}
              className="flex items-center justify-between gap-4 border-b border-dashed border-[var(--divider)] py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold text-grey-500">
                  {i + 1}
                </span>
                <span className="text-data text-sm font-semibold text-grey-800">
                  {o.code}
                </span>
                <span className="text-sm text-grey-600">{o.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatTHB(o.amount)}
              </span>
            </li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}
