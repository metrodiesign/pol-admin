"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Policy } from "@/types/policy";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PremiumCartPanel } from "./premium-cart-panel";

interface PremiumCartSheetProps {
  items: Policy[];
  count: number;
  total: number;
  onRemove: (id: string) => void;
  onProceed: () => void;
}

/**
 * Mobile (< mlg): ปุ่มลอย (FAB) แสดง badge count แบบ live + Sheet (side right)
 * ครอบ PremiumCartPanel ตัวเดียวกับ desktop (REQ-8.4, F-ui-9).
 */
export function PremiumCartSheet({
  items,
  count,
  total,
  onRemove,
  onProceed,
}: PremiumCartSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mlg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`เปิดตะกร้ารับชำระเบี้ย (${count} กรมธรรม์)`}
        className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-grey-800 text-white shadow-lg transition-colors hover:bg-grey-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-800 focus-visible:ring-offset-2"
      >
        <ShoppingCart className="size-6" aria-hidden />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-error px-1 text-xs font-bold text-white">
            {count}
          </span>
        ) : null}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetTitle className="sr-only">ตะกร้ารับชำระเบี้ย</SheetTitle>
          <PremiumCartPanel
            items={items}
            count={count}
            total={total}
            onRemove={onRemove}
            onProceed={() => {
              setOpen(false);
              onProceed();
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
