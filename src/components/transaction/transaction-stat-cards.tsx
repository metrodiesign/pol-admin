import { TRANSACTION_SUMMARY } from "@/lib/mock/transactions";
import { formatTHB, formatAmount } from "@/lib/utils";

/** ฿16.58M — ย่อหน่วยล้านบาท (฿ + ค่าหารล้าน ทศนิยม 2 ตำแหน่ง + M). */
function formatMillions(amount: number): string {
  return `฿${(amount / 1_000_000).toFixed(2)}M`;
}

const CARDS = [
  { label: "รายการทั้งหมด (วันนี้)", value: formatAmount(TRANSACTION_SUMMARY.totalToday) },
  { label: "มูลค่ารวม", value: formatMillions(TRANSACTION_SUMMARY.grossAmount) },
  { label: "ค่าธรรมเนียม PSP", value: formatTHB(TRANSACTION_SUMMARY.pspFee) },
  { label: "มูลค่ารับเข้าสุทธิ", value: formatMillions(TRANSACTION_SUMMARY.netAmount) },
];

/** แถวการ์ดสรุป 4 ใบของหน้าธุรกรรม. */
export function TransactionStatCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-sm font-semibold text-grey-600">{card.label}</p>
          <p className="mt-2 text-[28px] font-bold text-foreground md:text-[32px]">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
