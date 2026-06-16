"use client";

import { useState } from "react";
import { WidgetCard } from "./widget-card";
import { StackedBarChart } from "@/components/charts/stacked-bar-chart";
import { CATEGORICAL } from "@/components/charts/chart-colors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { areaInstalled } from "@/lib/mock/dashboard";

export function AreaInstalled() {
  const [year, setYear] = useState<string>(areaInstalled.years[0] ?? "2023");

  return (
    <WidgetCard
      title="Area installed"
      subtitle="(+43%) than last year"
      action={
        <Select value={year} onValueChange={(v) => v && setYear(v)}>
          <SelectTrigger className="h-8 w-[88px] rounded-control text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {areaInstalled.years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        {areaInstalled.totals.map((t, i) => (
          <div key={t.name} className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: CATEGORICAL[i % CATEGORICAL.length] }}
            />
            <span className="text-sm text-grey-600">{t.name}</span>
            <span className="text-sm font-semibold text-grey-800">{t.value}</span>
          </div>
        ))}
      </div>
      <StackedBarChart
        categories={areaInstalled.categories}
        series={areaInstalled.regions}
        grouped
        yDomain={[0, 80]}
        yTicks={[0, 20, 40, 60, 80]}
      />
    </WidgetCard>
  );
}
