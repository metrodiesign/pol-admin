import { TRANSACTION_SUMMARY } from "@/lib/mock/transactions";
import { formatAmount } from "@/lib/utils";

const CARDS = [
  { label: "รายการทั้งหมด (วันนี้)", value: formatAmount(TRANSACTION_SUMMARY.totalToday) },
  { label: "มูลค่ารวม",              value: formatAmount(TRANSACTION_SUMMARY.grossAmount) },
  { label: "ค่าธรรมเนียม PSP",      value: formatAmount(TRANSACTION_SUMMARY.pspFee) },
  { label: "มูลค่ารับเข้าสุทธิ",    value: formatAmount(TRANSACTION_SUMMARY.netAmount) },
];

export function TransactionStatCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-lg font-semibold text-grey-600">{card.label}</p>
          <p className="mt-2 text-4xl font-semibold text-foreground md:text-5xl">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
