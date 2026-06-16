import type { Invoice, InvoiceStatus } from "@/types/invoice";
import type { PaymentChannel } from "@/types/transaction";

const CUSTOMERS = [
  { name: "เมธาวิน อักษรเลิศ", email: "methawin.a@mail.com", phone: "081-234-5678" },
  { name: "กัลย์สุดา พิทักษ์เกษม", email: "kansuda.p@mail.com", phone: "089-872-3144" },
  { name: "ฤทธิรงค์ ปรัชญารัตน์", email: "ritthirong.p@mail.com", phone: "092-441-7820" },
  { name: "ขวัญข้าว นิรันดร์กุล", email: "kwankhao.n@mail.com", phone: "085-117-2398" },
  { name: "พัสกร อนาวิลกุล", email: "patsakorn.a@mail.com", phone: "081-998-6473" },
  { name: "ฐิตาพร เกษมพิพัฒน์", email: "thitaporn.k@mail.com", phone: "094-223-1109" },
  { name: "อาภัสรา ภาสกรพันธุ์", email: "arpatsara.p@mail.com", phone: "062-558-7720" },
  { name: "ปริยฉัตร ดวงประทีป", email: "pariyachat.d@mail.com", phone: "081-664-9012" },
];

const ORIGINATOR_IDS = ["BR-001", "BR-002", "BR-003", "AG-118", "AG-204", "BK-007", "AP-001", "AP-002"];
const CHANNELS: PaymentChannel[] = ["card", "qr", "installment", "card", "qr", "card"];
const STATUSES: InvoiceStatus[] = ["pending", "paid", "partial", "overdue", "expired", "voided", "draft"];
const POLICY_TYPES = ["ประกันรถยนต์", "ประกันชีวิต", "ประกันสุขภาพ", "ประกันอัคคีภัย", "ประกันการเดินทาง", "ประกันอุบัติเหตุ"];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(arr: T[], idx: number): T {
  return arr[((idx % arr.length) + arr.length) % arr.length] as T;
}

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function slug36(rng: () => number, len = 8): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += SLUG_CHARS.charAt(Math.floor(rng() * SLUG_CHARS.length));
  }
  return out;
}

function buildInvoices(n = 24): Invoice[] {
  const rnd = seeded(88);
  const slugRnd = seeded(424242);
  const arr: Invoice[] = [];
  const now = new Date("2026-05-24T14:32:00");

  for (let i = 0; i < n; i++) {
    const cust = pick(CUSTOMERS, Math.floor(rnd() * CUSTOMERS.length));
    const ch = pick(CHANNELS, Math.floor(rnd() * CHANNELS.length));
    const status = pick(STATUSES, Math.floor(rnd() * STATUSES.length));
    const originatorId = pick(ORIGINATOR_IDS, Math.floor(rnd() * ORIGINATOR_IDS.length));

    const itemCount = 1 + Math.floor(rnd() * 3);
    const items = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const amt = Math.round((2000 + rnd() * 18000) * 100) / 100;
      total += amt;
      items.push({
        policyNo: "POL-" + (2400000 + Math.floor(rnd() * 100000)),
        description: pick(POLICY_TYPES, Math.floor(rnd() * POLICY_TYPES.length)),
        type: pick(POLICY_TYPES, Math.floor(rnd() * POLICY_TYPES.length)),
        period: "งวด " + (1 + Math.floor(rnd() * 4)) + " · ปี 2026",
        amount: amt,
      });
    }
    const discount = rnd() < 0.2 ? Math.round(rnd() * 1000) : 0;
    const hoursAgo = Math.floor(i * 2 + rnd() * 4);
    const createdAt = new Date(now.getTime() - hoursAgo * 3600000);
    const expiryDays = 3 + Math.floor(rnd() * 27);
    const expiresAt = new Date(createdAt.getTime() + expiryDays * 86400000);

    arr.push({
      id: "PLK-" + String(50000 + i).padStart(6, "0"),
      url: "https://pay.centropay.th/l/" + slug36(slugRnd),
      channel: ch,
      views: Math.floor(rnd() * 40),
      expiresAt: expiresAt.toISOString(),
      status,
      items,
      customer: { name: cust.name, email: cust.email, phone: cust.phone },
      originatorId,
      refs: ["REF-" + (10000 + i)],
      discount,
      total: Math.round((total - discount) * 100) / 100,
      createdAt: createdAt.toISOString(),
    });
  }
  return arr;
}

export const INVOICES: Invoice[] = buildInvoices(24);
