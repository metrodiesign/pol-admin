import { WidgetCard } from "../widget-card";
import { currentBalance } from "@/lib/mock/ecommerce";

export function CurrentBalance() {
  return (
    <WidgetCard title="Current balance">
      <div className="space-y-5">
        <p
          className="text-3xl font-bold leading-[48px] text-grey-800"
          style={{ fontFamily: "var(--font-barlow, Barlow, sans-serif)" }}
        >
          {currentBalance.total}
        </p>
        <div className="space-y-3">
          {currentBalance.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-grey-500">{row.label}</span>
              <span
                className={
                  row.negative
                    ? "font-semibold text-error"
                    : "font-semibold text-grey-800"
                }
              >
                {row.negative ? `-${row.value}` : row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-grey-300" />
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-control border border-grey-800 px-4 py-2.5 text-sm font-bold text-grey-800 transition-colors hover:bg-grey-800/8"
          >
            Request
          </button>
          <button
            type="button"
            className="flex-1 rounded-control bg-[#00A76F] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#007867]"
          >
            Transfer
          </button>
        </div>
      </div>
    </WidgetCard>
  );
}
