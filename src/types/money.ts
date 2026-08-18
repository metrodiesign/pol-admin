export interface Money {
  amount: string; // ทศนิยม 4 ตำแหน่งตายตัวเสมอ ("35283.7100"), ห้ามติดลบ
  currency: string; // ISO 4217 ตัวพิมพ์ใหญ่ 3 ตัว ("THB")
}

/** จุดเดียวที่ parse Money.amount -> string แสดงผล — component ห้าม parseFloat/Number() เอง (REQ-1.8) */
export function formatMoney(money: Money, showCurrency = true): string {
  const value = Number(money.amount)
  if (Number.isNaN(value) || value < 0) {
    throw new RangeError(`Money.amount ไม่ถูกต้อง (ห้ามติดลบ): ${money.amount}`)
  }
  const formatted = new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
  return showCurrency ? `${formatted} ${money.currency}` : formatted
}
