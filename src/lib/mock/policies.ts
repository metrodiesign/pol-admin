// UI-only, ไม่มี endpoint รองรับ — pol-core ไม่มี entity Policy เลย และ Product
// ไม่มีฟิลด์ประกันสักตัว (REQ-7.2) ต้องมี Policy read endpoint ก่อนถึงจะ align ได้.
// Typed mock data (NO backend) — กรมธรรม์สำหรับ Policy Marketplace.
// 48 records: active 34 / due_soon 6 / awaiting 4 / lapsed 2 / cancelled 2 (REQ-2.2).
// 9 แถวแรก seed จาก screenshot จริง; ที่เหลือ generate แบบ deterministic (ไม่มี random).
// premium === totalAmount เสมอ (ยอดที่ตะกร้ารับชำระเก็บ = เบี้ยรวมที่แสดง).

import type { Policy, PolicyStatus, PremiumFrequency } from "@/types/policy";

const SEED: Policy[] = [
  {
    id: "POL-2401170",
    effectiveDate: "2025-07-31",
    coverageEnd: "2026-07-31",
    customer: { name: "ปริญฉัตร ดวงประทีป", phone: "081-664-9012", email: "parinchat.d@mail.example", nationalId: "1-1018-00942-21-3" },
    product: { type: "ประกันรถยนต์", plan: "ชั้น 3" },
    source: { code: "KKC", channel: "สาขาขอนแก่น" },
    insuranceKind: "VMI",
    referenceType: "policy",
    referenceNo: "06303-69100/รย/023880",
    extraInfo: { text: "กข 1001 กท" },
    sumInsured: 610606,
    premium: 14517.18,
    netPremium: 10162.03,
    totalAmount: 14517.18,
    frequency: "monthly",
    nextDue: { date: "2026-05-27", installmentNo: 10 },
    deduction: { state: "deducted", date: "2026-01-15" },
    vcp: "paid",
    status: "active",
  },
  {
    id: "POL-2405011",
    effectiveDate: "2024-08-05",
    coverageEnd: "2025-08-05",
    customer: { name: "พัสกร อนาวิลกุล", phone: "081-998-6473", email: "patsakorn.a@mail.example", nationalId: "3-1009-00821-45-7" },
    product: { type: "ประกันการเดินทาง", plan: "Travel Worldwide" },
    source: { code: "JCM", channel: "จันทรพร มงคลรัตน์" },
    insuranceKind: "VMI",
    referenceType: "claim",
    referenceNo: "69108/กธ/W00353",
    extraInfo: { text: "กท 2087" },
    sumInsured: 2214532,
    premium: 46326.85,
    netPremium: 32428.8,
    totalAmount: 46326.85,
    frequency: "monthly",
    nextDue: { date: "2026-05-27", installmentNo: 22 },
    deduction: { state: "none" },
    vcp: "none",
    status: "active",
  },
  {
    id: "POL-2402926",
    effectiveDate: "2025-05-30",
    coverageEnd: "2026-05-30",
    customer: { name: "ขวัญข้าว นิรันดร์กุล", phone: "085-117-2398", email: "kwankhao.n@mail.example", nationalId: "1-5099-00417-12-2" },
    product: { type: "ประกันการเดินทาง", plan: "Travel Schengen" },
    source: { code: "CPK", channel: "ชัยพร โกศลกิจ" },
    insuranceKind: "VMI",
    referenceType: "policy",
    referenceNo: "06303-69100/รย/023885",
    extraInfo: { text: "กข 3042" },
    sumInsured: 3614082,
    premium: 42313.73,
    netPremium: 29619.61,
    totalAmount: 42313.73,
    frequency: "quarterly",
    nextDue: { date: "2026-05-29", installmentNo: 4 },
    deduction: { state: "none" },
    vcp: "awaiting",
    status: "active",
  },
  {
    id: "POL-2404870",
    effectiveDate: "2025-11-29",
    coverageEnd: "2026-11-29",
    customer: { name: "ฐาปนินทร์ เวชวุฒิ", phone: "092-008-4471", email: "thapanin.w@mail.example", nationalId: "5-3015-00733-08-9" },
    product: { type: "ประกันสุขภาพ", plan: "Health Care Gold" },
    source: { code: "PMJ", channel: "พิมพ์มาดา เสริมสกุล" },
    insuranceKind: "VMI",
    referenceType: "claim",
    referenceNo: "69108/กธ/W00354",
    extraInfo: { text: "ขก 0453" },
    sumInsured: 4597527,
    premium: 13107.46,
    netPremium: 9175.22,
    totalAmount: 13107.46,
    frequency: "quarterly",
    nextDue: { date: "2026-05-30", installmentNo: 2 },
    deduction: { state: "none" },
    vcp: "none",
    status: "active",
  },
  {
    id: "POL-2405901",
    effectiveDate: "2024-11-07",
    coverageEnd: "2025-11-07",
    customer: { name: "กัลย์สุดา พิทักษ์เกษม", phone: "089-872-3144", email: "kalayasuda.p@mail.example", nationalId: "1-1020-00566-31-4" },
    product: { type: "ประกันการเดินทาง", plan: "Travel Asia" },
    source: { code: "SLM", channel: "สาขาสีลม" },
    insuranceKind: "VMI",
    referenceType: "policy",
    referenceNo: "06303-69100/รย/023901",
    extraInfo: { text: "พล 7781" },
    sumInsured: 1846738,
    premium: 45874.95,
    netPremium: 32112.47,
    totalAmount: 45874.95,
    frequency: "monthly",
    nextDue: { date: "2026-05-31", installmentNo: 19 },
    deduction: { state: "deducted", date: "2025-12-20" },
    vcp: "paid",
    status: "active",
  },
  {
    id: "POL-2403028",
    effectiveDate: "2026-05-04",
    coverageEnd: "2027-05-04",
    customer: { name: "ภาณุวิชญ์ ธีรานนท์", phone: "098-712-3344", email: "panuwit.t@mail.example", nationalId: "1-1101-00298-77-1" },
    product: { type: "ประกันสุขภาพ", plan: "Health Smart Plus" },
    source: { code: "KKC", channel: "สาขาขอนแก่น" },
    insuranceKind: "VMI",
    referenceType: "policy",
    referenceNo: "06303-69100/รย/024010",
    extraInfo: { text: "533", tooltip: "ประกันบ้าน" },
    sumInsured: 999195,
    premium: 7175.1,
    netPremium: 5022.57,
    totalAmount: 7175.1,
    frequency: "monthly",
    nextDue: { date: "2026-06-03", installmentNo: 1 },
    deduction: { state: "none" },
    vcp: "awaiting",
    status: "due_soon",
  },
  {
    id: "POL-2400329",
    effectiveDate: "2026-05-05",
    coverageEnd: "2027-05-05",
    customer: { name: "ภาณุวิชญ์ ธีรานนท์", phone: "098-712-3344", email: "panuwit.t@mail.example", nationalId: "1-1101-00298-77-1" },
    product: { type: "ประกันรถยนต์", plan: "ชั้น 2+" },
    source: { code: "NPI", channel: "ณัฐภัทร อินทรเดช" },
    insuranceKind: "CMI",
    referenceType: "claim",
    referenceNo: "69108/กธ/W00360",
    extraInfo: { text: "กข 0061" },
    sumInsured: 2492216,
    premium: 24552.67,
    netPremium: 17186.87,
    totalAmount: 24552.67,
    frequency: "monthly",
    nextDue: { date: "2026-06-04", installmentNo: 1 },
    deduction: { state: "none" },
    vcp: "none",
    status: "cancelled",
  },
  {
    id: "POL-2402062",
    effectiveDate: "2025-07-09",
    coverageEnd: "2026-07-09",
    customer: { name: "อาภัสรา ภาสกรพันธุ์", phone: "062-558-7720", email: "apatsara.p@mail.example", nationalId: "2-4007-00655-19-6" },
    product: { type: "ประกันอุบัติเหตุ", plan: "PA Plus" },
    source: { code: "NPI", channel: "ณัฐภัทร อินทรเดช" },
    insuranceKind: "VMI",
    referenceType: "policy",
    referenceNo: "06303-69100/รย/024055",
    extraInfo: { text: "นบ 4412" },
    sumInsured: 1351865,
    premium: 32386.27,
    netPremium: 22670.39,
    totalAmount: 32386.27,
    frequency: "monthly",
    nextDue: { date: "2026-06-04", installmentNo: 11 },
    deduction: { state: "none" },
    vcp: "none",
    status: "active",
  },
  {
    id: "POL-2404307",
    effectiveDate: "2025-09-07",
    coverageEnd: "2026-09-07",
    customer: { name: "ภาณุวิชญ์ ธีรานนท์", phone: "098-712-3344", email: "panuwit.t@mail.example", nationalId: "1-1101-00298-77-1" },
    product: { type: "ประกันอัคคีภัย", plan: "Home Shield Plus" },
    source: { code: "IPM", channel: "iPolicy Mobile" },
    insuranceKind: "VMI",
    referenceType: "policy",
    referenceNo: "06303-69100/รย/024099",
    extraInfo: { text: "บ้านเลขที่ 88", tooltip: "ประกันอัคคีภัย" },
    sumInsured: 3734650,
    premium: 28094.08,
    netPremium: 19665.86,
    totalAmount: 28094.08,
    frequency: "monthly",
    nextDue: { date: "2026-06-04", installmentNo: 9 },
    deduction: { state: "deducted", date: "2026-02-10" },
    vcp: "paid",
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
const PLATE_PREFIX = ["กข", "ขก", "พล", "นบ", "กท", "ฮศ"];
const VCP_CYCLE: Policy["vcp"][] = ["none", "awaiting", "paid"];

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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const GENERATED: Policy[] = REMAINING_STATUS.map((status, i) => {
  const seq = i + 1;
  // index modulo อยู่ในช่วงเสมอ — non-null ตัด string|undefined ของ noUncheckedIndexedAccess
  const name = NAMES[i % NAMES.length]!;
  const product = PRODUCTS[i % PRODUCTS.length]!;
  const source = SOURCES[i % SOURCES.length]!;
  const frequency = FREQS[i % FREQS.length]!;
  const plate = PLATE_PREFIX[i % PLATE_PREFIX.length]!;
  const sumInsured = 500000 + ((i * 137) % 50) * 75000;
  const premium = round2(6000 + ((i * 53) % 44) * 1000 + 0.5 * ((i % 4) + 1) * 100);
  const installmentNo = (i % 24) + 1;
  const dueDay = (i % 27) + 1;
  const month = (i % 12) + 1;
  const day = (i % 27) + 1;
  const isCar = product.type === "ประกันรถยนต์";
  const referenceType: Policy["referenceType"] = i % 3 === 0 ? "claim" : "policy";
  const referenceNo =
    referenceType === "claim"
      ? `69108/กธ/W${pad(300 + seq, 5)}`
      : `06303-69100/รย/${pad(24000 + seq * 3, 6)}`;
  const deducted = i % 5 === 0;
  return {
    id: `POL-24${pad(10000 + seq * 7, 5)}`,
    effectiveDate: `2025-${pad(month, 2)}-${pad(day, 2)}`,
    coverageEnd: `2026-${pad(month, 2)}-${pad(day, 2)}`,
    customer: {
      name,
      phone: `08${i % 10}-${pad((i * 311) % 1000, 3)}-${pad((i * 977) % 10000, 4)}`,
      email: `customer${pad(seq, 2)}@mail.example`,
      nationalId: `${(i % 8) + 1}-${pad((i * 211) % 10000, 4)}-${pad((i * 733) % 100000, 5)}-${pad((i * 17) % 100, 2)}-${i % 10}`,
    },
    product,
    source,
    insuranceKind: isCar ? (i % 2 === 0 ? "VMI" : "CMI") : "VMI",
    referenceType,
    referenceNo,
    extraInfo: { text: `${plate} ${pad((i * 37) % 1000, 3)}` },
    sumInsured,
    premium,
    netPremium: round2(premium * 0.7),
    totalAmount: premium,
    frequency,
    nextDue: { date: `2026-06-${pad(dueDay, 2)}`, installmentNo },
    deduction: deducted
      ? { state: "deducted", date: `2026-01-${pad((i % 27) + 1, 2)}` }
      : { state: "none" },
    vcp: VCP_CYCLE[i % VCP_CYCLE.length]!,
    status,
  };
});

export const POLICIES: Policy[] = [...SEED, ...GENERATED];
