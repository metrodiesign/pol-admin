import { cn } from "@/lib/utils";
import { INVOICE_STATS } from "@/lib/mock/invoice-minimals";

// Small SVG donut/progress ring
function DonutRing({
  color,
  bg,
  fill,
}: {
  color: string;
  bg: string;
  fill: number; // 0-100 percentage
}) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const strokeDash = (fill / 100) * circ;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
      {/* background ring */}
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke={bg}
        strokeWidth="4"
      />
      {/* progress arc */}
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${strokeDash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

const ITEMS = [
  {
    key: "total" as const,
    label: "Total",
    color: "#00B8D9",
    bg: "#CAFDF5",
    fill: 100,
  },
  {
    key: "paid" as const,
    label: "Paid",
    color: "#22C55E",
    bg: "#D3FCD2",
    fill: 50,
  },
  {
    key: "pending" as const,
    label: "Pending",
    color: "#FFAB00",
    bg: "#FFF5CC",
    fill: 30,
  },
  {
    key: "overdue" as const,
    label: "Overdue",
    color: "#FF5630",
    bg: "#FFE9D5",
    fill: 10,
  },
  {
    key: "draft" as const,
    label: "Draft",
    color: "#919EAB",
    bg: "#F4F6F8",
    fill: 10,
  },
];

export function InvoiceAnalytic() {
  return (
    /* Single card at all widths; inner flex row scrolls horizontally on mobile */
    <div className="dashboard-card mb-6 mmd:mb-10">
      <div className="flex overflow-x-auto">
        {ITEMS.map((item, idx) => {
          const stat = INVOICE_STATS[item.key];
          const isLast = idx === ITEMS.length - 1;
          return (
            <div
              key={item.key}
              className={cn(
                "flex min-w-[200px] flex-1 items-center gap-3 px-6 py-6",
                !isLast && "border-r border-dashed border-grey-300",
              )}
            >
              <DonutRing color={item.color} bg={item.bg} fill={item.fill} />
              <div className="min-w-0">
                <p className="text-base font-semibold leading-6 text-grey-800">{item.label}</p>
                <p className="text-xs text-grey-500">{stat.count} invoices</p>
                <p className="text-sm font-semibold text-grey-800">{stat.amount}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
