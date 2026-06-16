/**
 * Mock data for CentroPay dashboard widgets.
 * All numeric values approximate prototype totals.
 */

// ─── KPI stat cards ───────────────────────────────────────────────────────────

export interface KpiData {
  label: string;
  value: string;
  delta: string;
  direction: "up" | "down";
  sparkData: number[];
  sub: string;
}

export const DASHBOARD_KPIS: KpiData[] = [
  {
    label: "ยอดรับชำระวันนี้",
    value: "฿16.59M", // ≈ 16,588,720 + fee/rounding to ฿16.59M display
    delta: "+18.4% เมื่อวาน",
    direction: "up",
    sparkData: [9.1, 10.2, 8.8, 11.4, 12.0, 10.7, 13.2, 14.8, 13.5, 16.6],
    sub: "2,466 รายการสำเร็จ",
  },
  {
    label: "ลิงก์รอชำระ",
    value: "184",
    delta: "+12 จากชั่วโมงก่อน",
    direction: "up",
    sparkData: [120, 145, 110, 160, 142, 155, 170, 190, 178, 184],
    sub: "2,498 ลิงก์ที่เปิดในวันนี้",
  },
  {
    label: "ธุรกรรมสำเร็จ",
    value: "2,466",
    delta: "+5.2% เมื่อวาน",
    direction: "up",
    sparkData: [1800, 1940, 1780, 2100, 2020, 2140, 2300, 2250, 2380, 2466],
    sub: "อัตราความสำเร็จ 98.7%",
  },
  {
    label: "ธุรกรรมไม่สำเร็จ",
    value: "32",
    delta: "+3 จากเมื่อวาน",
    direction: "down",
    sparkData: [18, 22, 14, 28, 20, 24, 30, 26, 35, 32],
    sub: "1.3% ของทั้งหมด",
  },
];

// ─── Volume bar chart ──────────────────────────────────────────────────────────

export interface VolumePeriodData {
  labels: string[];
  values: number[];
  total: string;
  avg: string;
  avgLabel: string;
  delta: string;
}

function makeDays(n: number, seed: number): number[] {
  let s = seed;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: n }, (_, i) => {
    const trend = 1 + (i / n) * 0.25;
    return Math.round((8 + next() * 6) * trend * 10) / 10;
  });
}

const labels30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2026-04-25");
  d.setDate(d.getDate() + i);
  return `${d.getDate()}/${d.getMonth() + 1}`;
});

const labels90 = Array.from({ length: 90 }, (_, i) => {
  const d = new Date("2026-01-25");
  d.setDate(d.getDate() + i);
  // show label every 10 days to avoid clutter
  return i % 10 === 0 ? `${d.getDate()}/${d.getMonth() + 1}` : "";
});

const ytdMonthLabels = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."];

export const VOLUME_PERIODS: Record<"30d" | "90d" | "ytd", VolumePeriodData> = {
  "30d": {
    labels: labels30,
    values: makeDays(30, 42),
    total: "฿284.6M",
    avg: "฿9.48M",
    avgLabel: "ค่าเฉลี่ยต่อวัน",
    delta: "+18.4%",
  },
  "90d": {
    labels: labels90,
    values: makeDays(90, 77),
    total: "฿812.3M",
    avg: "฿9.03M",
    avgLabel: "ค่าเฉลี่ยต่อวัน",
    delta: "+12.7%",
  },
  ytd: {
    labels: ytdMonthLabels,
    values: [248.4, 221.8, 292.1, 310.6, 348.9],
    total: "฿1.42B",
    avg: "฿284M",
    avgLabel: "ค่าเฉลี่ยต่อเดือน",
    delta: "+24.1%",
  },
};

// ─── PSP donut ─────────────────────────────────────────────────────────────────

export interface PspSlice {
  psp: string;
  share: number;
  txn: number;
  volume: number;
  color: string;
}

export const PSP_SPLIT: PspSlice[] = [
  { psp: "2C2P",  share: 62, txn: 1529, volume: 10284620, color: "#0c68e9" },
  { psp: "Omise", share: 38, txn: 937,  volume:  6304100, color: "#00b8d9" },
];

// ─── Channel breakdown ─────────────────────────────────────────────────────────

export interface ChannelBreakdown {
  channel: "card" | "qr" | "installment" | "wallet" | "bank";
  label: string;
  volume: number;
  share: number;
  color: string;
}

export const CHANNEL_BREAKDOWN: ChannelBreakdown[] = [
  { channel: "card",        label: "บัตรเครดิต/เดบิต", volume: 9120400, share: 55, color: "#0c68e9" },
  { channel: "qr",          label: "PromptPay QR",      volume: 4640000, share: 28, color: "#22c55e" },
  { channel: "installment", label: "ผ่อนชำระ",          volume: 1824000, share: 11, color: "#8e33ff" },
  { channel: "wallet",      label: "E-Wallet",          volume:  828000, share:  5, color: "#ffab00" },
  { channel: "bank",        label: "Mobile Banking",    volume:  175720, share:  1, color: "#00b8d9" },
];

// ─── Top originators ───────────────────────────────────────────────────────────

export interface TopOriginator {
  rank: number;
  code: string;
  name: string;
  type: "สาขา" | "ตัวแทน" | "นายหน้า" | "แอป";
  count: number;
  amount: number;
  navTarget: string;
}

export const TOP_ORIGINATORS: TopOriginator[] = [
  { rank: 1, code: "IPM", name: "iPolicy Mobile",    type: "แอป",     count: 812, amount: 5820400, navTarget: "/apps" },
  { rank: 2, code: "SLM", name: "สาขาสีลม",          type: "สาขา",    count: 624, amount: 3842300, navTarget: "/branches" },
  { rank: 3, code: "GLK", name: "นายหน้าเซเนต์ลิงค์", type: "นายหน้า", count: 184, amount: 2418900, navTarget: "/agents" },
  { rank: 4, code: "RNP", name: "Renewal Portal",    type: "แอป",     count: 390, amount: 2104800, navTarget: "/apps" },
  { rank: 5, code: "CNX", name: "สาขาเชียงใหม่",     type: "สาขา",    count: 280, amount: 1720100, navTarget: "/branches" },
];
