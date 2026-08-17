import { WidgetCard } from "../widget-card";
import { orderTimeline } from "@/lib/mock/analytics";

export function AnalyticsOrderTimeline() {
  return (
    <WidgetCard title="Order timeline">
      <ol className="relative">
        {orderTimeline.map((event, i) => {
          const isLast = i === orderTimeline.length - 1;
          return (
            <li key={i} className="flex gap-4">
              {/* Separator: dot + connector, centered column */}
              <div className="flex flex-col items-center">
                <span
                  className="mt-[5px] size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                {!isLast && (
                  <span className="w-0.5 flex-1 bg-[rgba(145,158,171,0.2)]" />
                )}
              </div>
              {/* Content */}
              <div className={isLast ? "pb-1" : "pb-7"}>
                <p className="text-sm font-semibold leading-[22px] text-grey-800">
                  {event.title}
                </p>
                <p className="text-xs leading-[18px] text-grey-500">{event.time}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </WidgetCard>
  );
}
