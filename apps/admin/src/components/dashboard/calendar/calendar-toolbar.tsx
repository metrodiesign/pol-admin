"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Columns3, Square, AlignJustify, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarView } from "@/types/calendar";

interface CalendarToolbarProps {
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isMobile?: boolean;
}

const VIEW_BUTTONS: Array<{ value: CalendarView; icon: ReactNode; label: string }> = [
  { value: "month", icon: <LayoutGrid className="size-4" />, label: "Month view" },
  { value: "week", icon: <Columns3 className="size-4" />, label: "Week view" },
  { value: "day", icon: <Square className="size-4" />, label: "Day view" },
  { value: "agenda", icon: <AlignJustify className="size-4" />, label: "Agenda view" },
];

export function CalendarToolbar({
  view,
  onViewChange,
  periodLabel,
  onPrev,
  onNext,
  onToday,
  isMobile = false,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
      {/* Left: view switcher */}
      {isMobile ? (
        /* Mobile: dropdown trigger (non-functional dropdown for fidelity) */
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-2 py-1.5 text-sm text-grey-700 transition-colors hover:bg-grey-100"
        >
          <AlignJustify className="size-4" />
          <ChevronDown className="size-3.5 text-grey-500" />
        </button>
      ) : (
        <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
          {VIEW_BUTTONS.map(({ value, icon, label }) => (
            <button
              key={value}
              type="button"
              title={label}
              onClick={() => onViewChange(value)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                view === value
                  ? "bg-foreground text-card shadow-sm"
                  : "text-grey-600 hover:bg-grey-100 hover:text-grey-800"
              )}
            >
              {icon}
            </button>
          ))}
        </div>
      )}

      {/* Center: prev / period / next */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-7 w-7 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-100 hover:text-grey-800"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-[120px] text-center text-sm font-semibold leading-7 text-grey-800 sm:text-base">
          {periodLabel}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="flex h-7 w-7 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-100 hover:text-grey-800"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Right: Today + filter */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          className="rounded-lg px-2 py-1 text-xs font-bold leading-[22px] text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "rgb(255, 86, 48)" }}
        >
          Today
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-100 hover:text-grey-800"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}
