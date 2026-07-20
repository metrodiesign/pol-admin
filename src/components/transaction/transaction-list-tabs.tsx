"use client";

import type { PaymentSessionStatus } from "@/types/order-payment";
import { cn } from "@/lib/utils";

const BADGE_COLOR: Record<PaymentSessionStatus | "all", string> = {
  all:        "bg-foreground text-card",
  Created:    "bg-[rgba(255,171,0,0.16)] text-[rgb(183,110,0)]",
  Redirected: "bg-[rgba(0,184,217,0.16)] text-[rgb(0,108,156)]",
  Paid:       "bg-[rgba(34,197,94,0.16)] text-[rgb(17,141,87)]",
  Failed:     "bg-[rgba(255,86,48,0.16)] text-[rgb(183,29,24)]",
  Expired:    "bg-[rgba(145,158,171,0.16)] text-[rgb(99,115,129)]",
};

type TabValue = PaymentSessionStatus | "all";

interface TabItem {
  label: string;
  value: TabValue;
  count: number;
}

interface TransactionListTabsProps {
  tabs: TabItem[];
  active: TabValue;
  onChange: (value: TabValue) => void;
}

export function TransactionListTabs({ tabs, active, onChange }: TransactionListTabsProps) {
  return (
    <div className="flex w-full gap-1 overflow-x-auto bg-grey-200 p-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "h-9 shrink-0 rounded-lg px-4 text-sm transition-all whitespace-nowrap",
              isActive
                ? "bg-white font-semibold text-grey-800"
                : "font-medium text-grey-600 hover:text-grey-800",
            )}
            style={isActive ? { boxShadow: "var(--shadow-z1)" } : undefined}
          >
            {tab.label}
            <span className={cn(
              "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-xs font-bold leading-none",
              isActive ? "bg-foreground text-card" : BADGE_COLOR[tab.value],
            )}>
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
