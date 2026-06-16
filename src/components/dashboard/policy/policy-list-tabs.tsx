"use client";

import type { PaymentStatus } from "@/types/policy";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItem {
  label: string;
  value: PaymentStatus | "all";
  count: number;
}

interface PolicyListTabsProps {
  tabs: TabItem[];
  active: PaymentStatus | "all";
  onChange: (value: PaymentStatus | "all") => void;
}

const badgeColorMap: Record<string, string> = {
  all: "bg-grey-800 text-white",
  paid: "bg-success/16 text-success-dark",
  partial: "bg-warning/16 text-warning-dark",
  overdue: "bg-error/16 text-error-dark",
  unpaid: "bg-grey-500/16 text-grey-600",
};

export function PolicyListTabs({ tabs, active, onChange }: PolicyListTabsProps) {
  return (
    <Tabs value={active} onValueChange={(v) => onChange(v as PaymentStatus | "all")}>
      <TabsList
        variant="line"
        className="w-full justify-start gap-10 border-b-0 px-5 h-auto shadow-[inset_0_-2px_0_0_rgba(145,158,171,0.08)]"
      >
        {tabs.map((t) => {
          const isActive = active === t.value;
          return (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex-none gap-2 rounded-none px-0 py-[9px] text-sm data-active:text-foreground text-muted-foreground data-active:font-semibold font-medium"
            >
              {t.label}
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold ${
                  isActive
                    ? "bg-grey-800 text-white"
                    : badgeColorMap[t.value] || "bg-grey-200 text-grey-600"
                }`}
              >
                {t.count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
