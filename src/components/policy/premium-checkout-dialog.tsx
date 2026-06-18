"use client";

import SimpleBar from "simplebar-react";
import type { Policy } from "@/types/policy";
import { sumPremium } from "@/lib/policy/policy";
import { formatAmount } from "@/lib/utils";
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
  /** ยืนยันรายการ -> ไปหน้า checkout เต็มรูปแบบ (navigation จัดการที่ฝั่ง view) */
  onConfirm: () => void;
  onClose: () => void;
}

export function PremiumCheckoutDialog({
  open,
  policies,
  onConfirm,
  onClose,
}: PremiumCheckoutDialogProps) {
  const total = sumPremium(policies);
  const count = policies.length;

  function handleConfirm() {
    // ยืนยันรายการแล้วไปหน้า checkout (ชำระจริง mock ทำที่หน้านั้น)
    onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="theme-minimals sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            ยืนยันรับชำระเบี้ย
          </DialogTitle>
          <DialogDescription>
            ตรวจสอบรายการ {count} กรมธรรม์ ก่อนดำเนินการรับชำระเบี้ย
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-4 flex flex-col border-y border-[var(--divider)]">
          <div className="flex items-center justify-between bg-grey-100 px-4 py-2.5">
            <span className="text-sm font-semibold text-grey-700">กรมธรรม์</span>
            <span className="text-sm font-semibold text-grey-700">เบี้ยรวม</span>
          </div>
          <SimpleBar autoHide={false} style={{ maxHeight: "16rem" }} className="px-4">
            <ul className="flex flex-col">
              {policies.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b border-[var(--divider)] py-2.5 last:border-b-0"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {p.customer.name}
                    </span>
                    <span className="block truncate text-xs text-grey-500">{p.id}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                    {formatAmount(p.premium, 2)}
                  </span>
                </li>
              ))}
            </ul>
          </SimpleBar>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">เบี้ยรวม</span>
          <span className="text-xl font-bold tabular-nums text-primary">
            {formatAmount(total, 2)}
          </span>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button className="h-9 min-w-[100px] bg-[rgba(145,158,171,0.16)] font-bold text-grey-800 hover:bg-[rgba(145,158,171,0.24)]" />
            }
          >
            ยกเลิก
          </DialogClose>
          <Button
            onClick={handleConfirm}
            className="h-9 min-w-[100px] bg-grey-800 font-bold text-white hover:bg-grey-900"
          >
            ดำเนินการชำระเบี้ย
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
