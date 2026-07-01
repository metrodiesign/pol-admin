"use client";

import { CreditCard, ShoppingCart, Check, ChevronRight } from "lucide-react";
import type { PolicyCartMeta } from "@/types/table-meta";
import type { Policy } from "@/types/policy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PolicyRowActionsProps {
  policy: Policy;
  cart?: PolicyCartMeta;
}

/**
 * เซลล์ action ต่อแถว — ปุ่ม "ซื้อเลย" + เพิ่ม/นำออกตะกร้า แสดงทุกกรมธรรม์.
 * แถวที่มีสถานะชำระเงินแล้ว (vcp = "awaiting" รอชำระเงิน หรือ "paid" ชำระสำเร็จ) ปุ่มถูก disable (REQ-4 amended).
 * aria-label ผูก id ให้ screen reader แยกแถวได้ (REQ-9.1).
 */
export function PolicyRowActions({ policy, cart }: PolicyRowActionsProps) {
  if (!cart) {
    return (
      <div className="flex items-center justify-end pr-1">
        <ChevronRight className="size-4 text-grey-400" aria-hidden />
      </div>
    );
  }

  const inCart = cart.has(policy.id);
  // ล็อกปุ่มเมื่อมีสถานะชำระเงินแล้ว (รอชำระเงิน หรือ ชำระสำเร็จ) — REQ-4 amended
  const locked = policy.vcp !== "none";
  const lockedLabel = policy.vcp === "paid" ? "ชำระสำเร็จแล้ว" : "รอชำระเงิน";

  return (
    <TooltipProvider>
      <div className="flex items-center justify-start gap-1.5">
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <Button
              variant="default"
              size="icon-lg"
              disabled={locked}
              className="size-10 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={locked ? undefined : () => cart.buyNow(policy)}
              aria-label={locked ? `${policy.id} ${lockedLabel}` : `ซื้อ ${policy.id} เลย`}
            >
              <CreditCard className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{locked ? lockedLabel : "ซื้อเลย"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <Button
              variant="ghost"
              size="icon-lg"
              disabled={locked}
              className={cn(
                "size-10 cursor-pointer",
                inCart
                  ? "bg-secondary text-white hover:bg-secondary/90 hover:text-white focus-visible:bg-secondary focus-visible:text-white"
                  : "bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white",
              )}
              onClick={locked ? undefined : () => cart.toggle(policy)}
              aria-label={
                inCart
                  ? `นำ ${policy.id} ออกจากตะกร้า`
                  : `เพิ่ม ${policy.id} ลงตะกร้า`
              }
            >
              {inCart ? <Check className="size-5" /> : <ShoppingCart className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {locked ? lockedLabel : inCart ? "อยู่ในตะกร้า" : "เพิ่มลงตะกร้า"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
