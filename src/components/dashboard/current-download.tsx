import { WidgetCard } from "./widget-card";
import { DonutChart, DonutLegend } from "@/components/charts/donut-chart";
import { PRIMARY_RAMP } from "@/components/charts/chart-colors";
import { currentDownload } from "@/lib/mock/dashboard";

export function CurrentDownload() {
  return (
    <WidgetCard title="Current download" subtitle="Downloaded by operating system">
      <div className="flex flex-col gap-4 pt-4">
        <DonutChart
          data={currentDownload.data}
          total={currentDownload.total.toLocaleString()}
          totalLabel="Total"
          colors={PRIMARY_RAMP}
        />
        <div className="mt-6">
          <DonutLegend data={currentDownload.data} colors={PRIMARY_RAMP} />
        </div>
      </div>
    </WidgetCard>
  );
}
