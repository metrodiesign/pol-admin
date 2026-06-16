"use client";

import type { Policy } from "@/types/policy";
import { X } from "lucide-react";
import { formatTHB } from "@/lib/utils";

interface PaymentCartItemProps {
  policy: Policy;
  onRemove: (id: string) => void;
}

export function PaymentCartItem({ policy, onRemove }: PaymentCartItemProps) {
  return (
    <div className="rounded-control bg-grey-100 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">
            {policy.customerName}
          </p>
          <p className="text-xs text-grey-500">{policy.policyNumber}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(policy.id)}
          className="mt-0.5 shrink-0 text-grey-400 hover:text-error transition-colors"
          aria-label={`ลบ ${policy.policyNumber}`}
        >
          <X className="size-3.5" />
        </button>
      </div>
      <p className="mt-1 text-right text-sm font-bold text-foreground">
        {formatTHB(policy.premium)}
      </p>
    </div>
  );
}
