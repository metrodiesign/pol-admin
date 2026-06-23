"use client";

import { formatTHB } from "@/lib/utils";

interface CheckoutFooterBarProps {
  count: number;
  total: number;
  canIssue: boolean;
  onCancel: () => void;
  onIssue: () => void;
}

export function CheckoutFooterBar({
  count,
  total,
  canIssue,
  onCancel,
  onIssue,
}: CheckoutFooterBarProps) {
  return (
    <div
      className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-2xl bg-card px-5 py-4 mmd:flex-row mmd:items-center mmd:justify-between"
      style={{ boxShadow: "0 -8px 24px -12px rgba(145,158,171,0.4), var(--shadow-card)" }}
    >
      <div className="flex items-center gap-6">
        <div>
          <p className="text-sm text-grey-500">กรมธรรม์</p>
          <p className="text-xl font-bold tabular-nums text-foreground">{count}</p>
        </div>
        <div>
          <p className="text-sm text-grey-500">เบี้ยรวม</p>
          <p className="text-xl font-bold tabular-nums text-foreground">{formatTHB(total, 2)}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-5 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={onIssue}
          disabled={!canIssue}
          className="inline-flex h-11 items-center justify-center rounded-control bg-grey-800 px-5 text-sm font-bold text-white transition-colors hover:bg-grey-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-800 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ยืนยันคำสั่งซื้อกรมธรรม์
        </button>
      </div>
    </div>
  );
}
