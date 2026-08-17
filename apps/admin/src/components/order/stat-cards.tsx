import { ORDER_SUMMARY } from "@/lib/mock/orders";
import { formatAmount } from "@/lib/utils";

const CARDS = [
  { label: "รายการทั้งหมด (วันนี้)", value: formatAmount(ORDER_SUMMARY.totalToday) },
  { label: "มูลค่ารวม",              value: formatAmount(ORDER_SUMMARY.grossAmount) },
  { label: "ค่าธรรมเนียม PSP",      value: formatAmount(ORDER_SUMMARY.pspFee) },
  { label: "มูลค่ารับเข้าสุทธิ",    value: formatAmount(ORDER_SUMMARY.netAmount) },
];

export function OrderStatCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-sm font-semibold text-grey-600">{card.label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
