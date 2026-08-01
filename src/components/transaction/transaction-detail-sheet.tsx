"use client";

import SimpleBar from "simplebar-react";
import { X } from "lucide-react";
import type { PaymentSession } from "@/types/order-payment";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionDetailView } from "./transaction-detail-view";

interface TransactionDetailSheetProps {
  transaction: PaymentSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRead?: (t: PaymentSession) => void;
}

export function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="theme-minimals flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-[var(--divider)] px-4 py-3">
          <div className="min-w-0">
            <SheetTitle className="text-base font-bold text-foreground">
              รายละเอียดธุรกรรม
            </SheetTitle>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-grey-600">
                ธุรกรรม <span className="font-mono">• {transaction?.code ?? "—"}</span>
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <SheetClose className="flex size-9 items-center justify-center rounded-full text-grey-700 transition-colors hover:bg-[var(--action-hover)]">
              <X className="size-5" />
            </SheetClose>
          </div>
        </div>

        {/* Scrollable content */}
        <SimpleBar className="min-h-0 flex-1">
          <div className="px-4 py-4 sm:px-6">
            <TransactionDetailView id={transaction?.code} compact />
          </div>
        </SimpleBar>
      </SheetContent>
    </Sheet>
  );
}
