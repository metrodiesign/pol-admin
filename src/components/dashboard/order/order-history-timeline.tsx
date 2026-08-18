"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { OrderHistoryEvent, OrderKeyTime } from "@/types/order";
import { cn } from "@/lib/utils";

interface OrderHistoryTimelineProps {
  events: OrderHistoryEvent[];
  keyTimes: OrderKeyTime[];
}

export function OrderHistoryTimeline({
  events,
  keyTimes,
}: OrderHistoryTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleEvents = expanded ? events : events.slice(0, 5);

  return (
    <div className="flex flex-col-reverse gap-6 lg:flex-row">
      {/* Left: vertical timeline (on desktop flex-row, so it appears first; on mobile flex-col-reverse makes it appear second) */}
      <div className="flex-1">
        <div className="relative">
          {visibleEvents.map((event, i) => {
            const isFirst = i === 0;
            const isLast = i === visibleEvents.length - 1;

            return (
              <div key={i} className="relative flex gap-4">
                {/* Left column: dot + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative z-10 mt-0.5 flex size-3 shrink-0 items-center justify-center rounded-full",
                      event.active
                        ? "bg-success-dark"
                        : "border-2 border-[var(--divider)] bg-card",
                    )}
                  />
                  {!isLast && (
                    <div className="mt-1 w-px flex-1 bg-[var(--divider)]" />
                  )}
                </div>

                {/* Right column: content */}
                <div className={cn("pb-5 min-w-0", isFirst && "pt-0", isLast && "pb-0")}>
                  <p className="text-sm font-semibold text-foreground">
                    {event.label}
                  </p>
                  <p className="mt-0.5 text-xs text-grey-600">
                    {event.datetime}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex items-center gap-1 text-xs font-bold leading-[22px] text-foreground transition-opacity hover:opacity-70"
        >
          Show {expanded ? "less" : "more"}
          <ChevronRight
            className={cn(
              "size-4 transition-transform",
              expanded && "rotate-90",
            )}
          />
        </button>
      </div>

      {/* Right: key times */}
      <div className="w-full space-y-4 lg:w-[220px] lg:shrink-0">
        {keyTimes.map((kt, i) => (
          <div key={i}>
            <p className="text-xs text-grey-600">{kt.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {kt.datetime}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
