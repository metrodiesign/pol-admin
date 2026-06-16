import { cn } from "@/lib/utils";

export interface ChartLegendItem {
  label: string;
  color: string;
}

export function ChartLegend({
  items,
  className,
}: {
  items: ChartLegendItem[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-5 gap-y-2",
        className,
      )}
    >
      {items.map((it) => (
        <li
          key={it.label}
          className="flex items-center gap-1.5 text-[13px] font-medium text-foreground"
        >
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: it.color }}
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
