"use client";

import type { Policy } from "@/types/policy";
import { sumPremium } from "@/lib/policy/policy";
import { formatTHB } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PremiumCheckoutDialogProps {
  open: boolean;
  /** รายการที่จะรับชำระ — cart mode = หลายใบ, ซื้อเลย = 1 ใบ (REQ-6, 7) */
  policies: Policy[];
  /** cart mode = cart.clear; ซื้อเลย = no-op (REQ-7.4) */
  onConfirm: () => void;
  onSuccess: (message: string) => void;
  onClose: () => void;
}

export function PremiumCheckoutDialog({
  open,
  policies,
  onConfirm,
  onSuccess,
  onClose,
}: PremiumCheckoutDialogProps) {
  const total = sumPremium(policies);
  const count = policies.length;

  function handleConfirm() {
    // mock — ไม่เรียก backend (REQ-6.4, 7.3)
    onConfirm();
    onSuccess(`รับชำระเบี้ยสำเร็จ ${count} กรมธรรม์`);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>ยืนยันรับชำระเบี้ย</DialogTitle>
          <DialogDescription>
            ตรวจสอบรายการ {count} กรมธรรม์ ก่อนดำเนินการรับชำระเบี้ย
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {policies.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-control border border-[var(--divider)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-foreground">{p.id}</span>
                <span className="block truncate text-xs text-grey-500">{p.customer.name}</span>
              </div>
              <span className="shrink-0 text-sm font-bold text-foreground">
                {formatTHB(p.premium, 2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-[var(--divider)] pt-3">
          <span className="text-sm text-grey-600">เบี้ยรวม</span>
          <span className="text-lg font-bold text-foreground">{formatTHB(total, 2)}</span>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>ยกเลิก</DialogClose>
          <Button
            onClick={handleConfirm}
            className="bg-grey-800 text-white hover:bg-grey-900"
          >
            ยืนยันรับชำระเบี้ย
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
