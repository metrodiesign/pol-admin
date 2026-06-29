"use client";

import { useState } from "react";
import SimpleBar from "simplebar-react";
import { ChevronUp, ShoppingCart } from "lucide-react";
import type { Policy } from "@/types/policy";
import { formatTHB } from "@/lib/utils";
import { PremiumCartItem } from "./premium-cart-item";

interface PremiumCartBarProps {
  items: Policy[];
  count: number;
  total: number;
  onRemove: (id: string) => void;
  onProceed: () => void;
}

/**
 * ตะกร้ารับชำระเบี้ย — sticky bar ปักล่างจอ ทุกขนาดจอ (REQ: ย้ายจาก sidebar → bottom + collapse).
 * collapsed (default): เห็น count + เบี้ยรวม + ปุ่มชำระ. expand → รายการขึ้นบน scroll ได้.
 * แสดงตลอดแม้ตะกร้าว่าง (count 0 → ปุ่มชำระ disabled); จุดเพิ่มคือปุ่ม "เพิ่มลงตะกร้า" ในแถวตาราง.
 */
export function PremiumCartBar({
  items,
  count,
  total,
  onRemove,
  onProceed,
}: PremiumCartBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="sticky bottom-0 z-30 mt-6 overflow-hidden rounded-2xl bg-card"
      style={{ boxShadow: "0 -8px 24px -12px rgba(145,158,171,0.4), var(--shadow-card)" }}
    >
      {open ? (
        count === 0 ? (
          <div className="border-b border-[var(--divider)] px-5 py-8 text-center">
            <p className="text-sm font-bold text-foreground">ตะกร้ายังว่างอยู่</p>
            <p className="mt-1 text-xs text-grey-500">
              คลิก &quot;เพิ่มลงตะกร้า&quot; ที่กรมธรรม์ในตารางเพื่อรวมรับชำระเบี้ย
            </p>
          </div>
        ) : (
          <SimpleBar
            autoHide={false}
            style={{ maxHeight: "min(50vh, 420px)" }}
            className="border-b border-[var(--divider)]"
          >
            <ul className="space-y-2 px-4 py-4">
              {items.map((p) => (
                <PremiumCartItem key={p.id} policy={p} onRemove={onRemove} />
              ))}
            </ul>
          </SimpleBar>
        )
      ) : null}

      <div className="flex flex-col gap-3 px-5 py-4 mmd:flex-row mmd:items-center mmd:justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "ย่อตะกร้ารับชำระเบี้ย" : "ขยายตะกร้ารับชำระเบี้ย"}
          className="flex w-full items-center gap-3 text-left mmd:w-auto"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info/16 text-info-dark">
            <ShoppingCart className="size-4.5" aria-hidden />
          </span>
          <span className="text-sm font-bold text-foreground">ตะกร้ารับชำระเบี้ย</span>
          <ChevronUp
            className={
              "ml-auto size-5 shrink-0 text-grey-500 transition-transform " +
              (open ? "rotate-180" : "")
            }
            aria-hidden
          />
        </button>

        <div className="flex flex-col gap-3 mmd:flex-row mmd:items-center mmd:justify-end mmd:gap-6">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-grey-500">กรมธรรม์</p>
              <p className="text-xl font-bold tabular-nums text-foreground">{count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-grey-500">เบี้ยรวม</p>
              <p className="text-xl font-bold tabular-nums text-foreground">{formatTHB(total, 2)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onProceed}
            disabled={count === 0}
            aria-label="ดำเนินการชำระเบี้ย"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-control bg-grey-800 px-5 text-sm font-bold text-white transition-colors hover:bg-grey-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-800 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 mmd:w-auto"
          >
            ดำเนินการชำระเบี้ย
          </button>
        </div>
      </div>
    </div>
  );
}
