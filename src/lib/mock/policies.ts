// Typed mock data (NO backend) — กรมธรรม์สำหรับ Policy Marketplace.
// 48 records: active 34 / due_soon 6 / awaiting 4 / lapsed 2 / cancelled 2 (REQ-2.2).
// 9 แถวแรก seed จาก screenshot จริง; ที่เหลือ generate แบบ deterministic (ไม่มี random).

import type { Policy, PolicyStatus, PremiumFrequency } from "@/types/policy";

const SEED: Policy[] = [
  {
    id: "POL-2401170",
    effectiveDate: "2025-07-31",
    customer: { name: "ปริญฉัตร ดวงประทีป", phone: "081-664-9012" },
    product: { type: "ประกันรถยนต์", plan: "ชั้น 3" },
    source: { code: "KKC", channel: "สาขาขอนแก่น" },
    sumInsured: 610606,
    premium: 14517.18,
    frequency: "monthly",
    nextDue: { date: "2026-05-27", installmentNo: 10 },
    status: "active",
  },
  {
    id: "POL-2405011",
    effectiveDate: "2024-08-05",
    customer: { name: "พัสกร อนาวิลกุล", phone: "081-998-6473" },
    product: { type: "ประกันการเดินทาง", plan: "Travel Worldwide" },
    source: { code: "JCM", channel: "จันทรพร มงคลรัตน์" },
    sumInsured: 2214532,
    premium: 46326.85,
    frequency: "monthly",
    nextDue: { date: "2026-05-27", installmentNo: 22 },
    status: "active",
  },
  {
    id: "POL-2402926",
    effectiveDate: "2025-05-30",
    customer: { name: "ขวัญข้าว นิรันดร์กุล", phone: "085-117-2398" },
    product: { type: "ประกันการเดินทาง", plan: "Travel Schengen" },
    source: { code: "CPK", channel: "ชัยพร โกศลกิจ" },
    sumInsured: 3614082,
    premium: 42313.73,
    frequency: "quarterly",
    nextDue: { date: "2026-05-29", installmentNo: 4 },
    status: "active",
  },
  {
    id: "POL-2404870",
    effectiveDate: "2025-11-29",
    customer: { name: "ฐาปนินทร์ เวชวุฒิ", phone: "092-008-4471" },
    product: { type: "ประกันสุขภาพ", plan: "Health Care Gold" },
    source: { code: "PMJ", channel: "พิมพ์มาดา เสริมสกุล" },
    sumInsured: 4597527,
    premium: 13107.46,
    frequency: "quarterly",
    nextDue: { date: "2026-05-30", installmentNo: 2 },
    status: "active",
  },
  {
    id: "POL-2405901",
    effectiveDate: "2024-11-07",
    customer: { name: "กัลย์สุดา พิทักษ์เกษม", phone: "089-872-3144" },
    product: { type: "ประกันการเดินทาง", plan: "Travel Asia" },
    source: { code: "SLM", channel: "สาขาสีลม" },
    sumInsured: 1846738,
    premium: 45874.95,
    frequency: "monthly",
    nextDue: { date: "2026-05-31", installmentNo: 19 },
    status: "active",
  },
  {
    id: "POL-2403028",
    effectiveDate: "2026-05-04",
    customer: { name: "ภาณุวิชญ์ ธีรานนท์", phone: "098-712-3344" },
    product: { type: "ประกันสุขภาพ", plan: "Health Smart Plus" },
    source: { code: "KKC", channel: "สาขาขอนแก่น" },
    sumInsured: 999195,
    premium: 7175.1,
    frequency: "monthly",
    nextDue: { date: "2026-06-03", installmentNo: 1 },
    status: "due_soon",
  },
  {
    id: "POL-2400329",
    effectiveDate: "2026-05-05",
    customer: { name: "ภาณุวิชญ์ ธีรานนท์", phone: "098-712-3344" },
    product: { type: "ประกันรถยนต์", plan: "ชั้น 2+" },
    source: { code: "NPI", channel: "ณัฐภัทร อินทรเดช" },
    sumInsured: 2492216,
    premium: 24552.67,
    frequency: "monthly",
    nextDue: { date: "2026-06-04", installmentNo: 1 },
    status: "cancelled",
  },
  {
    id: "POL-2402062",
    effectiveDate: "2025-07-09",
    customer: { name: "อาภัสรา ภาสกรพันธุ์", phone: "062-558-7720" },
    product: { type: "ประกันอุบัติเหตุ", plan: "PA Plus" },
    source: { code: "NPI", channel: "ณัฐภัทร อินทรเดช" },
    sumInsured: 1351865,
    premium: 32386.27,
    frequency: "monthly",
    nextDue: { date: "2026-06-04", installmentNo: 11 },
    status: "active",
  },
  {
    id: "POL-2404307",
    effectiveDate: "2025-09-07",
    customer: { name: "ภาณุวิชญ์ ธีรานนท์", phone: "098-712-3344" },
    product: { type: "ประกันอัคคีภัย", plan: "Home Shield Plus" },
    source: { code: "IPM", channel: "iPolicy Mobile" },
    sumInsured: 3734650,
    premium: 28094.08,
    frequency: "monthly",
    nextDue: { date: "2026-06-04", installmentNo: 9 },
    status: "active",
  },
];

// ── deterministic generator สำหรับ record ที่เหลือ (39 ใบ) ───────────────────
const NAMES = [
  "ธนกฤต วโรดม",
  "ศิรประภา จันทร์เพ็ญ",
  "ณัฐวุฒิ บุญมาก",
  "พิมพ์ชนก ไพศาล",
  "กิตติพงศ์ เรืองศรี",
  "วรินทร ภักดี",
  "อนุสรา ทองดี",
  "ชยพล สิทธิเดช",
  "เบญจวรรณ ศรีสุข",
  "ปวริศ มหาชัย",
  "ธัญชนก อารยะ",
  "สหรัฐ พงษ์ไพบูลย์",
  "มนัสนันท์ วิไล",
];
const PRODUCTS: { type: string; plan: string }[] = [
  { type: "ประกันรถยนต์", plan: "ชั้น 1" },
  { type: "ประกันสุขภาพ", plan: "Health Care Gold" },
  { type: "ประกันการเดินทาง", plan: "Travel Asia" },
  { type: "ประกันอุบัติเหตุ", plan: "PA Plus" },
  { type: "ประกันอัคคีภัย", plan: "Home Shield Plus" },
  { type: "ประกันชีวิต", plan: "Life Secure" },
];
const SOURCES: { code: string; channel: string }[] = [
  { code: "KKC", channel: "สาขาขอนแก่น" },
  { code: "SLM", channel: "สาขาสีลม" },
  { code: "NPI", channel: "ณัฐภัทร อินทรเดช" },
  { code: "IPM", channel: "iPolicy Mobile" },
  { code: "JCM", channel: "จันทรพร มงคลรัตน์" },
  { code: "CPK", channel: "ชัยพร โกศลกิจ" },
];
const FREQS: PremiumFrequency[] = ["monthly", "quarterly", "yearly"];

// สถานะที่เหลือให้ครบ distribution เป้าหมาย (active 27, due_soon 5, awaiting 4, lapsed 2, cancelled 1)
const REMAINING_STATUS: PolicyStatus[] = [
  ...Array<PolicyStatus>(27).fill("active"),
  ...Array<PolicyStatus>(5).fill("due_soon"),
  ...Array<PolicyStatus>(4).fill("awaiting"),
  ...Array<PolicyStatus>(2).fill("lapsed"),
  ...Array<PolicyStatus>(1).fill("cancelled"),
];

function pad(n: number, len: number): string {
  return n.toString().padStart(len, "0");
}

const GENERATED: Policy[] = REMAINING_STATUS.map((status, i) => {
  const seq = i + 1;
  // index modulo อยู่ในช่วงเสมอ — non-null ตัด string|undefined ของ noUncheckedIndexedAccess
  const name = NAMES[i % NAMES.length]!;
  const product = PRODUCTS[i % PRODUCTS.length]!;
  const source = SOURCES[i % SOURCES.length]!;
  const frequency = FREQS[i % FREQS.length]!;
  const sumInsured = 500000 + ((i * 137) % 50) * 75000;
  const premium = Math.round((6000 + ((i * 53) % 44) * 1000 + 0.5 * ((i % 4) + 1) * 100) * 100) / 100;
  const installmentNo = (i % 24) + 1;
  const dueDay = (i % 27) + 1;
  return {
    id: `POL-24${pad(10000 + seq * 7, 5)}`,
    effectiveDate: `2025-${pad((i % 12) + 1, 2)}-${pad((i % 27) + 1, 2)}`,
    customer: { name, phone: `08${i % 10}-${pad((i * 311) % 1000, 3)}-${pad((i * 977) % 10000, 4)}` },
    product,
    source,
    sumInsured,
    premium,
    frequency,
    nextDue: { date: `2026-06-${pad(dueDay, 2)}`, installmentNo },
    status,
  };
});

export const POLICIES: Policy[] = [...SEED, ...GENERATED];
