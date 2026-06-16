import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Thai Baht with currency symbol — e.g. ฿1,234 */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Thai Baht plain (no symbol) — e.g. 1,234.50 (fractionDigits defaults to 2) */
export function formatTHBPlain(amount: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: fractionDigits,
  }).format(amount)
}
