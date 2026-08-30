"use client";

import { cn } from "@/lib/utils";

export type NotificationTab = "rules" | "log";

interface TabItem {
  label: string;
  value: NotificationTab;
  count: number;
}

/** Tab strip mirroring merchant user list tabs (button strip on grey-200 + count badge). */
export function NotificationTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: NotificationTab;
  onChange: (value: NotificationTab) => void;
}) {
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
            <span
              className={cn(
                "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-xs font-bold leading-none",
                isActive ? "bg-foreground text-card" : "bg-grey-500/16 text-grey-600",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
