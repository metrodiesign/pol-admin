"use client";

import type { Policy } from "@/types/policy";
import { PaymentCartItem } from "./payment-cart-item";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatTHB } from "@/lib/utils";

interface PolicySummaryCardProps {
  items: Policy[];
  total: number;
  onPay: () => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
}

export function PolicySummaryCard({
  items,
  total,
  onPay,
  onRemoveItem,
  onClear,
}: PolicySummaryCardProps) {
  const isEmpty = items.length === 0;

  return (
    <div
      className="rounded-card bg-card px-6 pb-10 pt-6"
      style={{
        boxShadow:
          "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
      }}
    >
      <h6 className="mb-4 text-sm font-semibold">ตะกร้าชำระเงิน</h6>

      {isEmpty ? (
        <p className="py-8 text-center text-sm text-grey-500">ยังไม่มีรายการ</p>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((policy) => (
              <PaymentCartItem
                key={policy.id}
                policy={policy}
                onRemove={onRemoveItem}
              />
            ))}
          </div>

          <Separator className="my-4" />

          <div className="mb-4 flex items-center justify-between text-sm font-semibold">
            <span>ยอดรวม</span>
            <span>{formatTHB(total)}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-grey-800 text-white hover:bg-grey-900 font-semibold"
              onClick={onPay}
            >
              ออกลิงก์ชำระเงิน
            </Button>
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={onClear}
            >
              ล้างรายการ
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
