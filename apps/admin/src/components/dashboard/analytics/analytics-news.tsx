import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { WidgetCard } from "../widget-card";
import { newsItems } from "@/lib/mock/analytics";

export function AnalyticsNews() {
  return (
    <WidgetCard title="News" bodyClassName="p-0">
      <ul>
        {newsItems.map((item, i) => (
          <li
            key={item.title}
            className={`flex gap-4 px-6 py-4 ${
              i < newsItems.length - 1
                ? "border-b border-dashed border-grey-300"
                : ""
            }`}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-grey-800 hover:underline line-clamp-2">
                {item.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-grey-500">
                {item.description}
              </p>
            </div>
            <span className="shrink-0 pt-0.5 text-xs text-grey-500 whitespace-nowrap">
              {item.postedAt}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-dashed border-[var(--divider)] p-3 text-right">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-control px-3 py-1.5 text-sm font-semibold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
        >
          View all
          <ArrowRight className="size-4" />
        </button>
      </div>
    </WidgetCard>
  );
}
