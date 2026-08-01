"use client";

import type { UserStatus } from "@/types/user";
import { statusStyles } from "./user-table-columns";
import { cn } from "@/lib/utils";

const BADGE_COLOR: Record<UserStatus | "all", string> = {
  all: "bg-foreground text-card",
  ...statusStyles,
};

type TabValue = UserStatus | "all";

interface TabItem {
  label: string;
  value: TabValue;
  count: number;
}

interface UserListTabsProps {
  tabs: TabItem[];
  active: TabValue;
  onChange: (value: TabValue) => void;
}

export function UserListTabs({ tabs, active, onChange }: UserListTabsProps) {
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
