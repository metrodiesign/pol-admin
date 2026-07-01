import type { AccentColor, Trend } from "./dashboard";

export interface PaymentSummaryStat {
  title: string;
  total: string;
  trend: Trend;
  caption: string;
  color: Extract<AccentColor, "success" | "error">;
}

export const paymentSummaryStats: PaymentSummaryStat[] = [
  {
    title: "ยอดรับชำระวันนี้",
    total: "16.58M",
    trend: { value: 12.4, up: true },
    caption: "เทียบกับเมื่อวาน 14.75M",
    color: "success",
  },
  {
    title: "ลิงก์รอชำระ",
    total: "184",
    trend: { value: 3.2, up: false },
    caption: "มูลค่ารวม 2.84M",
    color: "error",
  },
  {
    title: "ธุรกรรมสำเร็จ",
    total: "2,466",
    trend: { value: 8.1, up: true },
    caption: "มูลค่ารวม 16.17M",
    color: "success",
  },
  {
    title: "ธุรกรรมไม่สำเร็จ",
    total: "32",
    trend: { value: 14.2, up: false },
    caption: "มูลค่ารวม 412,800",
    color: "error",
  },
];
