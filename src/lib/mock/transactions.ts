import type { Transaction, TransactionStatus, PaymentChannel, PspName, TransactionOriginator } from "@/types/transaction";

const CUSTOMERS = [
  { name: "เมธาวิน อักษรเลิศ", email: "methawin.a@mail.com", phone: "081-234-5678" },
  { name: "กัลย์สุดา พิทักษ์เกษม", email: "kansuda.p@mail.com", phone: "089-872-3144" },
  { name: "ฤทธิรงค์ ปรัชญารัตน์", email: "ritthirong.p@mail.com", phone: "092-441-7820" },
  { name: "ขวัญข้าว นิรันดร์กุล", email: "kwankhao.n@mail.com", phone: "085-117-2398" },
  { name: "พัสกร อนาวิลกุล", email: "patsakorn.a@mail.com", phone: "081-998-6473" },
  { name: "ฐิตาพร เกษมพิพัฒน์", email: "thitaporn.k@mail.com", phone: "094-223-1109" },
  { name: "อาภัสรา ภาสกรพันธุ์", email: "arpatsara.p@mail.com", phone: "062-558-7720" },
  { name: "ปริยฉัตร ดวงประทีป", email: "pariyachat.d@mail.com", phone: "081-664-9012" },
  { name: "ภาณุวิชญ์ ธีรกานต์", email: "panuwit.t@mail.com", phone: "098-712-3344" },
  { name: "ณิชารัศม์ พุฒิเมธี", email: "nicharat.p@mail.com", phone: "084-330-1827" },
  { name: "สุพิชญา ตรีรัตนวัฒน์", email: "supichaya.t@mail.com", phone: "081-455-9923" },
  { name: "ฐาปนินทร์ เวชวุฒิ", email: "thapanin.w@mail.com", phone: "092-008-4471" },
];

const ORIGINATORS: TransactionOriginator[] = [
  { id: "BR-001", type: "branch", name: "สาขาสีลม", code: "SLM", region: "กรุงเทพฯ" },
  { id: "BR-002", type: "branch", name: "สาขาเชียงใหม่", code: "CNX", region: "ภาคเหนือ" },
  { id: "BR-003", type: "branch", name: "สาขาภูเก็ต", code: "HKT", region: "ภาคใต้" },
  { id: "AG-118", type: "agent", name: "ปาณิสรา ทองอุดม", code: "PYS", region: "กรุงเทพฯ" },
  { id: "AG-204", type: "agent", name: "ธีรเดช อรุณโชติ", code: "TWS", region: "ปทุมธานี" },
  { id: "BK-007", type: "broker", name: "นายหน้าเซเนต์ลิงค์", code: "GLK", region: "กรุงเทพฯ" },
  { id: "AP-001", type: "app", name: "iPolicy Mobile", code: "IPM", region: "—" },
];

const POLICY_TYPES = ["ประกันรถยนต์", "ประกันชีวิต", "ประกันสุขภาพ", "ประกันอัคคีภัย", "ประกันการเดินทาง", "ประกันอุบัติเหตุ"];
const CHANNELS: PaymentChannel[] = ["card", "qr", "installment", "card", "qr", "card"];
const PSPS: PspName[] = ["2C2P", "Omise"];

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

function buildTransactions(n = 30): Transaction[] {
  const rnd = seeded(42);
  const arr: Transaction[] = [];
  const now = new Date("2026-05-24T14:32:00");

  for (let i = 0; i < n; i++) {
    const cust = pick(CUSTOMERS, Math.floor(rnd() * CUSTOMERS.length));
    const orig = pick(ORIGINATORS, Math.floor(rnd() * ORIGINATORS.length));
    const ch = pick(CHANNELS, Math.floor(rnd() * CHANNELS.length));
    const psp = pick(PSPS, Math.floor(rnd() * PSPS.length));

    let status: TransactionStatus;
    const r = rnd();
    if (r < 0.62) status = "succeeded";
    else if (r < 0.78) status = "pending";
    else if (r < 0.86) status = "processing";
    else if (r < 0.93) status = "failed";
    else if (r < 0.97) status = "refunded";
    else status = "voided";

    const itemCount = 1 + Math.floor(rnd() * 4);
    const items = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const amt = Math.round((1200 + rnd() * 28800) * 100) / 100;
      total += amt;
      items.push({
        policyNo: "POL-" + (1000000 + Math.floor(rnd() * 8999999)),
        type: pick(POLICY_TYPES, Math.floor(rnd() * POLICY_TYPES.length)),
        period: "งวด " + (1 + Math.floor(rnd() * 4)) + " · ปี " + (2026 - Math.floor(rnd() * 2)),
        amount: amt,
      });
    }

    const minutesAgo = Math.floor(i * 13 + rnd() * 9);
    const ts = new Date(now.getTime() - minutesAgo * 60000);

    arr.push({
      id: "TXN-2026-" + String(100000 + i).padStart(6, "0"),
      ref: "PLK-" + String(50000 + i).padStart(6, "0"),
      customer: { name: cust.name, email: cust.email, phone: cust.phone },
      originator: orig,
      channel: ch,
      psp,
      status,
      amount: Math.round(total * 100) / 100,
      itemCount,
      items,
      ts: ts.toISOString(),
    });
  }
  return arr;
}

export const TRANSACTIONS: Transaction[] = buildTransactions(30);
