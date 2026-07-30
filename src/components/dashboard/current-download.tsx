import { WidgetCard } from "./widget-card";
import { DonutChart, DonutLegend } from "@/components/charts/donut-chart";
import { ACCENT_HEX, CATEGORICAL } from "@/components/charts/chart-colors";
import { currentDownload } from "@/lib/mock/dashboard";

const STATUS_COLORS = [ACCENT_HEX.warning, CATEGORICAL[0]!, ACCENT_HEX.error];

export function CurrentDownload() {
  return (
    <WidgetCard title="สถานะธุรกรรม" subtitle="จำนวนรายการแยกตามสถานะ">
      <div className="flex flex-col gap-4 pt-4">
        <DonutChart
          data={currentDownload.data}
          total={currentDownload.total.toLocaleString()}
          totalLabel="รวมทั้งหมด"
          colors={STATUS_COLORS}
        />
        <div className="mt-6">
          <DonutLegend data={currentDownload.data} colors={STATUS_COLORS} />
        </div>
      </div>
    </WidgetCard>
  );
}
