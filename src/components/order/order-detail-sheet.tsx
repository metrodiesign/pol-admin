"use client";

import SimpleBar from "simplebar-react";
import { ExternalLink, X } from "lucide-react";
import type { Order } from "@/types/order-payment";
import { formatTHB } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderDetailView } from "./order-detail-view";

interface OrderDetailSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRead?: (t: Order) => void;
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  onRead,
}: OrderDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-[var(--divider)] px-4 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="font-mono text-sm font-semibold text-foreground">
                {order?.code ?? "—"}
              </SheetTitle>
              {order && (
                <OrderStatusBadge status={order.status} />
              )}
            </div>
            {order && (
              <p className="mt-0.5 text-xs text-grey-500">
                {order.customerName}
                {" · "}
                {formatTHB(order.amount, 2)}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {onRead && order && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="ดูรายละเอียดเต็ม"
                onClick={() => onRead(order)}
              >
                <ExternalLink className="size-4" />
              </Button>
            )}
            <SheetClose
              render={
                <Button variant="ghost" size="icon-sm" aria-label="ปิด" />
              }
            >
              <X className="size-4" />
            </SheetClose>
          </div>
        </div>

        {/* Scrollable content */}
        <SimpleBar className="min-h-0 flex-1">
          <OrderDetailView id={order?.code} compact />
        </SimpleBar>
      </SheetContent>
    </Sheet>
  );
}
