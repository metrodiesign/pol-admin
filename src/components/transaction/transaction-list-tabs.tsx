"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import type { TransactionStatus } from "@/types/transaction";
import { cn } from "@/lib/utils";

type TabValue = TransactionStatus | "all";

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

const INACTIVE_BADGE: Record<TabValue, string> = {
  all: "bg-foreground text-card",
  completed: "bg-[rgba(34,197,94,0.16)] text-[rgb(17,141,87)]",
  pending: "bg-[rgba(255,171,0,0.16)] text-[rgb(183,110,0)]",
  processing: "bg-[rgba(0,184,217,0.16)] text-[rgb(0,108,156)]",
  failed: "bg-[rgba(255,86,48,0.16)] text-[rgb(183,29,24)]",
  refunded: "bg-[rgba(142,51,255,0.16)] text-[rgb(142,51,255)]",
  cancelled: "bg-[rgba(145,158,171,0.16)] text-[rgb(99,115,129)]",
};

export function TransactionListTabs({ tabs, active, onChange }: TransactionListTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 120, behavior: "smooth" });
  };

  return (
    <div className="relative flex border-b" style={{ borderColor: "rgba(145,158,171,0.08)" }}>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto px-5 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 border-b-2 pb-[7px] pt-[9px] text-sm font-semibold transition-colors",
                "mr-8 last:mr-0",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent font-medium text-grey-600 hover:text-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold leading-none",
                  isActive ? "bg-foreground text-card" : INACTIVE_BADGE[tab.value],
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right scroll affordance — visible only when more tabs are off-screen */}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll tabs right"
          onClick={handleScrollRight}
          className="absolute right-0 top-0 flex h-full items-center bg-gradient-to-l from-card via-card/80 to-transparent pl-6 pr-2 text-grey-600"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
