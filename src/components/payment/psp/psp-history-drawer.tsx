"use client";

import { useMemo } from "react";
import { EntityDrawer } from "@/components/payment/entity-drawer";
import type { PspConfig } from "@/types/psp";

interface DayData {
  date: Date;
  volume: number;
  txn: number;
  successRate: string;
}

function generate30DayData(psp: PspConfig): DayData[] {
  const days: DayData[] = [];
  let v = psp.todayVolume / 1.2;
  for (let i = 29; i >= 0; i--) {
    const delta =
      (Math.sin(i / 4) * 0.08 + (i % 7 === 0 ? -0.15 : 0)) * v;
    v = Math.max(
      psp.todayVolume * 0.4,
      Math.min(psp.todayVolume * 1.6, v + delta),
    );
    days.push({
      date: new Date(2026, 4, 24 - i),
      volume: Math.round(v),
      txn: Math.round(v / 6800),
      successRate: (97.5 + Math.sin(i / 3) * 1.2).toFixed(1),
    });
  }
  return days;
}

function formatTHB(baht: number): string {
  return baht.toLocaleString("th-TH");
}

interface PspHistoryDrawerProps {
  psp: PspConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PspHistoryDrawer({
  psp,
  open,
  onOpenChange,
}: PspHistoryDrawerProps) {
  const days = useMemo(
    () => (psp ? generate30DayData(psp) : []),
    [psp],
  );

  const total = days.reduce((s, d) => s + d.volume, 0);
  const totalTxn = days.reduce((s, d) => s + d.txn, 0);
  const avgSr =
    days.length > 0
      ? (
          days.reduce((s, d) => s + Number(d.successRate), 0) / days.length
        ).toFixed(1)
      : "0.0";
  const maxVol = days.length > 0 ? Math.max(...days.map((d) => d.volume)) : 1;

  if (!psp) return null;

  return (
    <EntityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={psp.label}
      description="ประวัติ 30 วันย้อนหลัง"
      width="sm:max-w-[680px]"
    >
      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[rgba(145,158,171,0.12)] bg-grey-500/5 p-3">
          <p className="text-xs text-grey-500">มูลค่ารวม 30 วัน</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums">
            ฿{(total / 1_000_000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-lg border border-[rgba(145,158,171,0.12)] bg-grey-500/5 p-3">
          <p className="text-xs text-grey-500">ธุรกรรมรวม</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums">
            {totalTxn.toLocaleString("th-TH")}
          </p>
        </div>
        <div className="rounded-lg border border-[rgba(145,158,171,0.12)] bg-grey-500/5 p-3">
          <p className="text-xs text-grey-500">Success Rate เฉลี่ย</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {avgSr}%
          </p>
        </div>
      </div>

      {/* 30-day CSS bar chart */}
      <div className="mt-4 rounded-lg border border-[rgba(145,158,171,0.12)] bg-grey-500/5 p-4">
        <p className="mb-3 text-sm font-semibold">ปริมาณรายวัน (฿M)</p>
        <div className="flex h-[120px] items-end gap-0.5">
          {days.map((d, i) => {
            const heightPct = maxVol > 0 ? (d.volume / maxVol) * 100 : 0;
            const dateLabel = d.date.toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
            });
            const volLabel = `฿${(d.volume / 1_000_000).toFixed(2)}M`;
            return (
              <div
                key={i}
                className="group relative min-w-0 flex-1 cursor-pointer"
                title={`${dateLabel} · ${volLabel}`}
              >
                <div
                  className="w-full rounded-t bg-primary/30 transition-colors group-hover:bg-primary"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-grey-500">
          <span>
            {days[0]?.date.toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
            })}
          </span>
          <span>
            {days[days.length - 1]?.date.toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      </div>

      {/* Recent 10 days table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-[rgba(145,158,171,0.12)]">
        <div className="grid grid-cols-4 gap-2 bg-grey-500/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-grey-500">
          <div>วันที่</div>
          <div className="text-right">ธุรกรรม</div>
          <div className="text-right">มูลค่า</div>
          <div className="text-right">Success</div>
        </div>
        {[...days].reverse().slice(0, 10).map((d, i, arr) => (
          <div
            key={i}
            className={`grid grid-cols-4 gap-2 px-3.5 py-2 text-sm${
              i < arr.length - 1
                ? " border-b border-[rgba(145,158,171,0.08)]"
                : ""
            }`}
          >
            <div>
              {d.date.toLocaleDateString("th-TH", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              })}
            </div>
            <div className="text-right tabular-nums">
              {d.txn.toLocaleString("th-TH")}
            </div>
            <div className="text-right font-semibold tabular-nums">
              ฿{formatTHB(d.volume)}
            </div>
            <div className="text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {d.successRate}%
            </div>
          </div>
        ))}
      </div>
    </EntityDrawer>
  );
}
