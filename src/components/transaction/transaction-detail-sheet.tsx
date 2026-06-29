"use client";

import SimpleBar from "simplebar-react";
import { ExternalLink, X } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { formatTHB } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionStatusBadge } from "./transaction-status-badge";
import { TransactionDetailView } from "./transaction-detail-view";

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRead?: (t: Transaction) => void;
}

export function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
  onRead,
}: TransactionDetailSheetProps) {
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
                {transaction?.code ?? "—"}
              </SheetTitle>
              {transaction && (
                <TransactionStatusBadge status={transaction.status} />
              )}
            </div>
            {transaction && (
              <p className="mt-0.5 text-xs text-grey-500">
                {transaction.customerName}
                {" · "}
                {formatTHB(transaction.amount, 2)}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {onRead && transaction && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="ดูรายละเอียดเต็ม"
                onClick={() => onRead(transaction)}
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
          <TransactionDetailView id={transaction?.code} compact />
        </SimpleBar>
      </SheetContent>
    </Sheet>
  );
}
