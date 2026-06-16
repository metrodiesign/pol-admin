import type { PspName, PaymentChannel } from "@/types/transaction";

export interface ReconciliationRow {
  date: string;
  psp: PspName;
  expected: number;
  settled: number;
  /** true = ตรง / กำลังรอ, false = พบส่วนต่าง */
  match: boolean;
  status: "กระทบยอดแล้ว" | "รอ T+2" | "รอ T+3" | "พบส่วนต่าง";
}

export const RECONCILIATION_ROWS: ReconciliationRow[] = [
  { date: "24 พ.ค.", psp: "2C2P",  expected: 12480500, settled: 0,        match: true,  status: "รอ T+2" },
  { date: "23 พ.ค.", psp: "2C2P",  expected: 11824300, settled: 0,        match: true,  status: "รอ T+2" },
  { date: "22 พ.ค.", psp: "2C2P",  expected: 13104200, settled: 13104200, match: true,  status: "กระทบยอดแล้ว" },
  { date: "22 พ.ค.", psp: "Omise", expected: 4218900,  settled: 4218900,  match: true,  status: "กระทบยอดแล้ว" },
  { date: "21 พ.ค.", psp: "2C2P",  expected: 10942800, settled: 10942800, match: true,  status: "กระทบยอดแล้ว" },
  { date: "21 พ.ค.", psp: "Omise", expected: 3815400,  settled: 3814200,  match: false, status: "พบส่วนต่าง" },
];

export interface ChannelBreakdownRow {
  channel: PaymentChannel;
  label: string;
  txn: number;
  vol: number;
  fee: number;
  net: number;
}

export const CHANNEL_BREAKDOWN: ChannelBreakdownRow[] = [
  { channel: "card",        label: "บัตรเครดิต/เดบิต", txn: 14820, vol: 184281000, fee: 4607025,  net: 179673975 },
  { channel: "qr",          label: "PromptPay QR",      txn: 9248,  vol: 64412800,  fee: 515302,   net: 63897498  },
  { channel: "installment", label: "ผ่อนชำระ",          txn: 2104,  vol: 35902800,  fee: 1148889,  net: 34753911  },
];

export interface PspBreakdownRow {
  psp: PspName;
  txn: number;
  vol: number;
  successRate: number;
  settlement: string;
}

export const PSP_BREAKDOWN: PspBreakdownRow[] = [
  { psp: "2C2P",  txn: 19284, vol: 218840100, successRate: 98.7, settlement: "T+2" },
  { psp: "Omise", txn: 6888,  vol: 65756500,  successRate: 97.9, settlement: "T+3" },
];

export interface OriginatorBreakdownRow {
  id: string;
  name: string;
  type: "branch" | "agent" | "broker" | "app";
  txn: number;
  vol: number;
}

export const ORIGINATOR_BREAKDOWN: OriginatorBreakdownRow[] = [
  { id: "BR-001", name: "สาขาสีลม",            type: "branch", txn: 1284, vol: 9842300  },
  { id: "BR-002", name: "สาขาเชียงใหม่",        type: "branch", txn: 786,  vol: 5217800  },
  { id: "BR-003", name: "สาขาภูเก็ต",           type: "branch", txn: 412,  vol: 3120400  },
  { id: "BR-004", name: "สาขาขอนแก่น",          type: "branch", txn: 318,  vol: 2102600  },
  { id: "AP-001", name: "iPolicy Mobile",       type: "app",    txn: 2104, vol: 14820500 },
  { id: "AP-002", name: "Renewal Portal",       type: "app",    txn: 1620, vol: 11304800 },
  { id: "AG-118", name: "ปาณิสรา ทองอุดม",      type: "agent",  txn: 92,   vol: 1240000  },
  { id: "BK-007", name: "นายหน้าเซเนต์ลิงค์",  type: "broker", txn: 184,  vol: 2418900  },
];

