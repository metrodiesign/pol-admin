"use client";

import type { InvoiceStatus } from "@/types/invoice";
import { cn } from "@/lib/utils";

export type InvoiceTabKey = InvoiceStatus | "all";

interface Tab {
  label: string;
  value: InvoiceTabKey;
  count: number;
}

interface InvoiceListTabsProps {
  tabs: Tab[];
  active: InvoiceTabKey;
  onChange: (v: InvoiceTabKey) => void;
}

export function InvoiceListTabs({ tabs, active, onChange }: InvoiceListTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[rgba(145,158,171,0.12)] px-5 py-3">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
            active === tab.value
              ? "bg-grey-800 text-white"
              : "text-grey-600 hover:bg-[var(--action-hover)] hover:text-foreground",
          )}
        >
          {tab.label}
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
              active === tab.value
                ? "bg-white/20 text-white"
                : "bg-grey-200 text-grey-600",
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
