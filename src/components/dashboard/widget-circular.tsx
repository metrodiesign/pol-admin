import { RadialChart } from "@/components/charts/radial-chart";
import { widgetCircular, type CircularWidget } from "@/lib/mock/dashboard";

const cardColor: Record<CircularWidget["color"], string> = {
  primary: "#00A76F",
  info: "#006C9C",
};

export function WidgetCircularGroup() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {widgetCircular.map((w) => (
        <div
          key={w.title}
          className="flex flex-1 items-center justify-between gap-4 rounded-card px-6 py-5 text-white shadow-card"
          style={{ backgroundColor: cardColor[w.color] }}
        >
          <div>
            <p className="text-2xl font-bold">{w.total}</p>
            <p className="mt-1 text-sm text-white/80">{w.title}</p>
          </div>
          <RadialChart
            value={w.value}
            barColor="#ffffff"
            trackFill="rgba(255,255,255,0.24)"
            labelClassName="text-white"
            size={104}
          />
        </div>
      ))}
    </div>
  );
}
