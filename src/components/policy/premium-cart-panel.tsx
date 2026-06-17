"use client";

import { ShoppingCart } from "lucide-react";
import type { Policy } from "@/types/policy";
import { formatTHB } from "@/lib/utils";
import { PremiumCartItem } from "./premium-cart-item";

interface PremiumCartPanelProps {
  items: Policy[];
  count: number;
  total: number;
  onRemove: (id: string) => void;
  onProceed: () => void;
}

export function PremiumCartPanel({
  items,
  count,
  total,
  onRemove,
  onProceed,
}: PremiumCartPanelProps) {
  const empty = count === 0;

  return (
    <section
      aria-label="ตะกร้ารับชำระเบี้ย"
      className="flex h-full flex-col rounded-2xl bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <header className="flex items-center gap-3 border-b border-[var(--divider)] px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info/16 text-info-dark">
          <ShoppingCart className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">ตะกร้ารับชำระเบี้ย</h2>
          <p className="text-xs text-grey-500">{count} กรมธรรม์</p>
        </div>
      </header>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-info/12 text-info">
            <ShoppingCart className="size-7" aria-hidden />
          </span>
          <p className="text-sm font-bold text-foreground">ตะกร้ายังว่างอยู่</p>
          <p className="text-xs leading-relaxed text-grey-500">
            คลิก &quot;เพิ่มลงตะกร้า&quot; ที่กรมธรรม์ในตารางด้านซ้าย
            เพื่อรวมรับชำระเบี้ยทีเดียว
          </p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {items.map((p) => (
            <PremiumCartItem key={p.id} policy={p} onRemove={onRemove} />
          ))}
        </ul>
      )}

      <footer className="border-t border-[var(--divider)] px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-grey-600">เบี้ยรวม</span>
          <span className="text-lg font-bold text-foreground">{formatTHB(total, 2)}</span>
        </div>
        <button
          type="button"
          onClick={onProceed}
          disabled={empty}
          aria-label="ดำเนินการชำระเบี้ย"
          className="h-11 w-full rounded-control bg-grey-800 text-sm font-bold text-white transition-colors hover:bg-grey-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-800 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ดำเนินการชำระเบี้ย
        </button>
      </footer>
    </section>
  );
}
