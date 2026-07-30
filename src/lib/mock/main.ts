// UI-only, ไม่มี endpoint รองรับ — payment summary stat นี้ไม่มี endpoint จริงใน
// pol-core ต้องมี summary endpoint ก่อนถึงจะ align ได้ (REQ-7.2).
import type { AccentColor, Trend } from "./dashboard";

export interface PaymentSummaryStat {
  title: string;
  total: string;
  trend: Trend;
  caption: string;
  color: Extract<AccentColor, "success" | "warning" | "error">;
}

export const paymentSummaryStats: PaymentSummaryStat[] = [
  {
    title: "ยอดรับชำระวันนี้",
    total: "16,580,000.00",
    trend: { value: 12.4, up: true },
    caption: "เทียบกับเมื่อวาน 14,750,000.00",
    color: "success",
  },
  {
    title: "ลิงก์รอชำระ",
    total: "184",
    trend: { value: 3.2, up: false },
    caption: "มูลค่ารวม 2,840,000.00",
    color: "warning",
  },
  {
    title: "ธุรกรรมสำเร็จ",
    total: "2,466",
    trend: { value: 8.1, up: true },
    caption: "มูลค่ารวม 16,170,000.00",
    color: "success",
  },
  {
    title: "ธุรกรรมไม่สำเร็จ",
    total: "32",
    trend: { value: 14.2, up: false },
    caption: "มูลค่ารวม 412,800.00",
    color: "error",
  },
];
