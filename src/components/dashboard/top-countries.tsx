import { Smartphone, Monitor, Apple } from "lucide-react";
import { WidgetCard } from "./widget-card";
import { topCountries } from "@/lib/mock/dashboard";

export function TopCountries() {
  return (
    <WidgetCard title="Top installed countries">
      <ul className="space-y-4">
        {topCountries.map((c) => (
          <li key={c.code} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/flags/${c.code.toUpperCase()}.svg`}
              alt={c.name}
              className="h-5 w-7 shrink-0 rounded-sm object-cover"
            />
            <span className="min-w-0 flex-1 text-sm font-semibold text-grey-800">{c.name}</span>
            <div className="flex items-center gap-3 text-xs text-grey-700">
              <span className="flex items-center gap-1">
                <Smartphone className="size-3.5 text-grey-500" />
                {c.android.toFixed(2)}k
              </span>
              <span className="flex items-center gap-1">
                <Monitor className="size-3.5 text-grey-500" />
                {c.windows.toFixed(2)}k
              </span>
              <span className="flex items-center gap-1">
                <Apple className="size-3.5 text-grey-500" />
                {c.apple.toFixed(2)}k
              </span>
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
