"use client";

import { Send } from "lucide-react";
import { formatTHB } from "@/lib/utils";

interface CheckoutFooterBarProps {
  total: number;
  canIssue: boolean;
  onCancel: () => void;
  onIssue: () => void;
}

export function CheckoutFooterBar({
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
      <div className="min-w-0">
        <p className="text-[13px] text-grey-500">ยอดรวมที่จะส่งให้ลูกค้าชำระ</p>
        <p className="text-2xl font-bold tabular-nums text-foreground">{formatTHB(total, 2)}</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-5 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={onIssue}
          disabled={!canIssue}
          className="inline-flex h-10 items-center gap-1.5 rounded-control bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-4" />
          ยืนยันคำสั่งซื้อกรมธรรม์
        </button>
      </div>
    </div>
  );
}
