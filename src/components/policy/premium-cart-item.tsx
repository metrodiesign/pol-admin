"use client";

import { X } from "lucide-react";
import type { Policy } from "@/types/policy";
import { formatTHB } from "@/lib/utils";

interface PremiumCartItemProps {
  policy: Policy;
  onRemove: (id: string) => void;
}

export function PremiumCartItem({ policy, onRemove }: PremiumCartItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-control border border-[var(--divider)] px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">
          {policy.customer.name}
        </span>
        <span className="block truncate text-xs text-primary">{policy.id}</span>
      </div>
      <span className="shrink-0 text-sm font-bold text-foreground">
        {formatTHB(policy.premium, 2)}
      </span>
      <button
        type="button"
        onClick={() => onRemove(policy.id)}
        aria-label={`นำ ${policy.id} ออกจากตะกร้า`}
        className="shrink-0 rounded-full p-1 text-grey-500 transition-colors hover:bg-error/8 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-800"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}
