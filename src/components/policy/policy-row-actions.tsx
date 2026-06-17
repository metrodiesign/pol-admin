"use client";

import { Zap, ShoppingCart, Check, ChevronRight } from "lucide-react";
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
 * เซลล์ action ต่อแถว — ปุ่ม "ซื้อเลย" + เพิ่ม/นำออกตะกร้า แสดงทุกกรมธรรม์
 * (user: ครบทุกรายการ). aria-label ผูก id ให้ screen reader แยกแถวได้ (REQ-9.1).
 * ถ้ายังไม่ wire cart -> chevron อย่างเดียว.
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

  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1.5">
        <Button
          variant="default"
          size="sm"
          className="h-10 cursor-pointer gap-1.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => cart.buyNow(policy)}
          aria-label={`ซื้อ ${policy.id} เลย`}
        >
          <Zap className="size-4" />
          ซื้อเลย
        </Button>
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <Button
              variant="ghost"
              size="icon-lg"
              className={cn(
                "size-10 cursor-pointer",
                inCart
                  ? "bg-grey-800 text-white hover:bg-grey-800/90 focus-visible:bg-grey-800 focus-visible:text-white"
                  : "bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white",
              )}
              onClick={() => cart.toggle(policy)}
              aria-label={
                inCart
                  ? `นำ ${policy.id} ออกจากตะกร้า`
                  : `เพิ่ม ${policy.id} ลงตะกร้า`
              }
            >
              {inCart ? <Check className="size-5" /> : <ShoppingCart className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{inCart ? "อยู่ในตะกร้า" : "เพิ่มลงตะกร้า"}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
