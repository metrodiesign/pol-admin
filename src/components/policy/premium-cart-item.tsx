"use client";

import { Trash2 } from "lucide-react";
import type { Policy } from "@/types/policy";
import { formatTHB } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        <span className="block truncate text-xs font-semibold text-primary">{policy.id}</span>
      </div>
      <span className="shrink-0 text-sm font-bold text-foreground">
        {formatTHB(policy.premium, 2)}
      </span>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => onRemove(policy.id)}
        aria-label={`นำ ${policy.id} ออกจากตะกร้า`}
        className="size-10 shrink-0 cursor-pointer text-error hover:bg-error/8 hover:text-error"
      >
        <Trash2 className="size-5" />
      </Button>
    </li>
  );
}
