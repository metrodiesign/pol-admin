"use client";

import type { Policy } from "@/types/policy";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { PaymentCartItem } from "./payment-cart-item";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/payment/toast/toast-provider";
import { formatTHB } from "@/lib/utils";

interface PaymentCartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Policy[];
  total: number;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  /** Override checkout destination (defaults to /invoices/new?policies=...) */
  onCheckout?: () => void;
}

export function PaymentCartSheet({
  open,
  onOpenChange,
  items,
  total,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: PaymentCartSheetProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const toast = useToast();

  function handleCheckout() {
    onOpenChange(false);
    toast.info("กำลังไปออกใบแจ้งหนี้", {
      description: `${items.length} รายการ`,
    });
    if (onCheckout) {
      onCheckout();
    } else {
      const ids = items.map((p) => p.id).join(",");
      router.push(`/invoices/new?policies=${ids}`);
    }
    // Cart is consumed by the invoice form (policies passed via query) — clear it.
    onClearCart();
  }
  const side = isMobile ? "bottom" : "right";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton
        className={
          side === "right"
            ? "w-[400px] sm:max-w-[400px] flex flex-col gap-0"
            : "h-[85vh] rounded-t-[16px] flex flex-col gap-0"
        }
      >
        {side === "bottom" && (
          <div className="flex justify-center pt-2 pb-0">
            <div className="h-1 w-8 rounded-full bg-grey-400" />
          </div>
        )}

        <SheetHeader className="border-b border-grey-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-foreground" />
            <div>
              <SheetTitle className="text-base font-bold">
                ตะกร้า
              </SheetTitle>
              <SheetDescription>
                {items.length} รายการ
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-grey-500">
              <ShoppingCart className="size-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">ยังไม่มีรายการ</p>
              <p className="text-xs mt-1">เลือกกรมธรรม์จากตารางเพื่อเพิ่มในตะกร้า</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((policy) => (
                <PaymentCartItem
                  key={policy.id}
                  policy={policy}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-grey-200 px-5 py-4 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-grey-600">รวมทั้งหมด</span>
              <span className="text-lg font-bold text-foreground">
                {formatTHB(total)}
              </span>
            </div>
            <Button className="w-full h-11 text-sm font-bold" onClick={handleCheckout}>
              ออกลิงก์ชำระเงิน
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
