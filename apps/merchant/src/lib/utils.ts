import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * จัดรูปจำนวนเงินบาท: thousands separator (locale th-TH) + prefix ฿.
 * `decimals` คุมทศนิยมคงที่ — ทุนประกันใช้ 0, เบี้ยใช้ 2.
 */
export function formatAmount(amount: number, decimals = 0): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatTHB(amount: number, decimals = 0): string {
  return formatAmount(amount, decimals)
}

const THAI_MONTHS_ABBR = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
]

/**
 * ISO yyyy-mm-dd -> "31 ก.ค. 68" (วัน + เดือนย่อไทย + ปี พ.ศ. 2 หลัก).
 * parse จาก string parts เลี่ยงปัญหา timezone ของ new Date.
 */
export function formatThaiShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  const month = THAI_MONTHS_ABBR[m - 1] ?? ""
  const beYear2 = (y + 543) % 100
  return `${d} ${month} ${beYear2.toString().padStart(2, "0")}`
}

/**
 * ISO yyyy-mm-dd -> "01/01/2569" (วว/ดด/ปปปป พ.ศ. เต็ม 4 หลัก).
 * ใช้กับช่วงคุ้มครอง/วันตัดชำระในตารางกรมธรรม์.
 */
export function formatThaiSlashDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  const beYear = y + 543
  return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${beYear}`
}
