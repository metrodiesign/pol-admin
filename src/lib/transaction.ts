import type { Transaction, TransactionStatus, PaymentChannel, Psp } from "@/types/transaction";
import { TRANSACTIONS } from "@/lib/mock/transactions";

export const STATUS_LABEL: Record<TransactionStatus, string> = {
  completed: "สำเร็จ", pending: "รอชำระ", processing: "กำลังประมวลผล",
  failed: "ล้มเหลว", refunded: "คืนเงิน", cancelled: "ยกเลิก",
};
// pill styles — follow existing token families (see src/components/user/user-table-columns.tsx statusStyles)
export const STATUS_STYLE: Record<TransactionStatus, string> = {
  completed: "bg-success/16 text-success-dark",
  pending: "bg-warning/16 text-warning-dark",
  processing: "bg-info/16 text-info-dark",
  failed: "bg-error/16 text-error-dark",
  refunded: "bg-secondary/16 text-secondary-dark",
  cancelled: "bg-grey-500/16 text-grey-600",
};
// dot color before status label inside the pill
export const STATUS_DOT: Record<TransactionStatus, string> = {
  completed: "bg-success", pending: "bg-warning", processing: "bg-info",
  failed: "bg-error", refunded: "bg-secondary", cancelled: "bg-grey-500",
};
export const CHANNEL_LABEL: Record<PaymentChannel, string> = {
  card: "บัตรเครดิต/เดบิต", promptpay: "PromptPay QR", installment: "ผ่อนชำระ",
};
// channel dot colors (Minimals palette): card=blue info, promptpay=green success, installment=purple
export const CHANNEL_DOT: Record<PaymentChannel, string> = {
  card: "bg-info", promptpay: "bg-success", installment: "bg-[#8E33FF]",
};
export const PSP_LABEL: Record<Psp, string> = { omise: "Omise", "2c2p": "2C2P" };

// 4-dot lifecycle stepper state. done = filled green, active = current (blue), rest empty.
// failed/cancelled use the tone to color the active/last dot.
export function lifecycleStage(status: TransactionStatus): { done: number; active: number; tone: "ok" | "error" | "muted" } {
  switch (status) {
    case "completed": return { done: 4, active: 0, tone: "ok" };
    case "refunded": return { done: 4, active: 0, tone: "muted" };
    case "processing": return { done: 2, active: 1, tone: "ok" };
    case "pending": return { done: 0, active: 1, tone: "ok" };
    case "failed": return { done: 1, active: 1, tone: "error" };
    case "cancelled": return { done: 0, active: 0, tone: "muted" };
  }
}

export function getTransactionById(id: string | undefined): Transaction | undefined {
  if (!id) return undefined;
  return TRANSACTIONS.find((t) => t.id === id || t.code === id);
}

// CSV export (client-side). header ไทย.
export function toCsv(rows: Transaction[]): string {
  const head = ["รหัสธุรกรรม", "ลูกค้า", "อีเมล", "ที่มา", "ช่องทาง", "PSP", "จำนวน", "สถานะ", "เวลา"];
  const esc = (v: string) => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  const body = rows.map((t) => [
    t.code, t.customerName, t.customerEmail, `${t.source.code} ${t.source.label}`,
    CHANNEL_LABEL[t.channel], PSP_LABEL[t.psp], t.amount.toFixed(2), STATUS_LABEL[t.status], t.time,
  ].map((c) => esc(String(c))).join(","));
  return [head.join(","), ...body].join("\n");
}

export function downloadCsv(filename: string, rows: Transaction[]): void {
  const blob = new Blob(["\ufeff" + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// \u2500\u2500 \u0e2b\u0e19\u0e49\u0e32 detail: derive \u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e19\u0e33\u0e40\u0e2a\u0e19\u0e2d\u0e08\u0e32\u0e01 transaction \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// \u0e40\u0e01\u0e47\u0e1a\u0e43\u0e19 mock \u0e08\u0e30\u0e1a\u0e27\u0e21\u0e17\u0e31\u0e49\u0e07 48 \u0e41\u0e16\u0e27 \u2192 derive \u0e41\u0e1a\u0e1a deterministic \u0e08\u0e32\u0e01\u0e23\u0e2b\u0e31\u0e2a (\u0e40\u0e2a\u0e16\u0e35\u0e22\u0e23\u0e02\u0e49\u0e32\u0e21 render,
// \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e49 Math.random/Date \u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e01\u0e31\u0e19 hydration mismatch). amount/total \u0e04\u0e07\u0e04\u0e48\u0e32\u0e08\u0e23\u0e34\u0e07\u0e08\u0e32\u0e01 mock.

function seedOf(t: Transaction): number {
  const n = Number(t.code.replace(/\D/g, "").slice(-6));
  return Number.isFinite(n) ? n : 0;
}

/** \u0e40\u0e1a\u0e2d\u0e23\u0e4c\u0e42\u0e17\u0e23\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32 (mock) \u2014 deterministic \u0e08\u0e32\u0e01\u0e23\u0e2b\u0e31\u0e2a\u0e18\u0e38\u0e23\u0e01\u0e23\u0e23\u0e21. */
export function customerPhone(t: Transaction): string {
  const s = seedOf(t);
  const a = (s % 9) + 1;
  const b = String(100 + ((s * 7) % 900));
  const c = String(1000 + ((s * 13) % 9000));
  return `08${a}-${b}-${c}`;
}

/** ลิงก์ชำระเงิน (mock) — short code + url, deterministic จากรหัสธุรกรรม. */
export function payLink(t: Transaction): { code: string; url: string } {
  const s = seedOf(t);
  const code = ((s * 2654435761) % 0x7fffffff).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return { code, url: `pay.cpg.co/${code}` };
}

const BRANCHES = [
  { code: "KKC", label: "\u0e2a\u0e32\u0e02\u0e32\u0e02\u0e2d\u0e19\u0e41\u0e01\u0e48\u0e19" },
  { code: "BKK", label: "\u0e2a\u0e32\u0e02\u0e32\u0e01\u0e23\u0e38\u0e07\u0e40\u0e17\u0e1e" },
  { code: "CMI", label: "\u0e2a\u0e32\u0e02\u0e32\u0e40\u0e0a\u0e35\u0e22\u0e07\u0e43\u0e2b\u0e21\u0e48" },
  { code: "HDY", label: "\u0e2a\u0e32\u0e02\u0e32\u0e2b\u0e32\u0e14\u0e43\u0e2b\u0e0d\u0e48" },
];
const SOURCE_ROLES = [
  "\u0e1e\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e2a\u0e32\u0e02\u0e32",
  "\u0e15\u0e31\u0e27\u0e41\u0e17\u0e19\u0e2d\u0e34\u0e2a\u0e23\u0e30",
  "\u0e19\u0e32\u0e22\u0e2b\u0e19\u0e49\u0e32\u0e19\u0e34\u0e15\u0e34\u0e1a\u0e38\u0e04\u0e04\u0e25",
  "\u0e1e\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19\u0e02\u0e32\u0e22\u0e15\u0e23\u0e07",
];

export interface SourceDetail {
  role: string;
  location: string;
  branchCode: string;
  branchLabel: string;
  linkRef: string;
}
export function sourceDetail(t: Transaction): SourceDetail {
  const s = seedOf(t);
  const branch = BRANCHES[s % BRANCHES.length] ?? { code: "KKC", label: "สาขาขอนแก่น" };
  return {
    role: SOURCE_ROLES[s % SOURCE_ROLES.length] ?? "\u0e1e\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e2a\u0e32\u0e02\u0e32",
    location: branch.label.replace("\u0e2a\u0e32\u0e02\u0e32", ""),
    branchCode: branch.code,
    branchLabel: branch.label,
    linkRef: `PLK-${String(50000 + (s - 100000)).padStart(6, "0")}`,
  };
}

const INSURED_NAMES = [
  "\u0e2d\u0e32\u0e20\u0e31\u0e2a\u0e23\u0e32 \u0e20\u0e32\u0e2a\u0e01\u0e23\u0e1e\u0e31\u0e19\u0e18\u0e38\u0e4c",
  "\u0e18\u0e19\u0e01\u0e24\u0e15 \u0e27\u0e42\u0e23\u0e14\u0e21",
  "\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e0a\u0e19\u0e01 \u0e44\u0e1e\u0e28\u0e32\u0e25",
  "\u0e13\u0e31\u0e10\u0e27\u0e38\u0e12\u0e34 \u0e41\u0e2a\u0e07\u0e17\u0e2d\u0e07",
  "\u0e0a\u0e19\u0e34\u0e01\u0e32\u0e19\u0e15\u0e4c \u0e1a\u0e38\u0e0d\u0e21\u0e35",
  "\u0e1b\u0e34\u0e22\u0e30\u0e1e\u0e07\u0e29\u0e4c \u0e28\u0e23\u0e35\u0e2a\u0e38\u0e02",
  "\u0e27\u0e23\u0e23\u0e13\u0e27\u0e34\u0e2a\u0e32 \u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c\u0e40\u0e1e\u0e47\u0e0d",
  "\u0e01\u0e34\u0e15\u0e15\u0e34\u0e1e\u0e07\u0e28\u0e4c \u0e23\u0e31\u0e01\u0e29\u0e32\u0e27\u0e07\u0e28\u0e4c",
];
const DOC_TYPES = ["\u0e40\u0e25\u0e02\u0e01\u0e23\u0e21\u0e18\u0e23\u0e23\u0e21\u0e4c", "\u0e40\u0e25\u0e02\u0e23\u0e31\u0e1a\u0e41\u0e08\u0e49\u0e07", "\u0e40\u0e25\u0e02\u0e2a\u0e25\u0e31\u0e01\u0e2b\u0e25\u0e31\u0e07"] as const;
const REF_PREFIX = ["\u0e19\u0e1a", "\u0e01\u0e02", "\u0e09\u0e07", "\u0e1e\u0e25", "\u0e0a\u0e21"];

// \u0e40\u0e25\u0e02\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e15\u0e32\u0e21\u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17 (mock): \u0e01\u0e23\u0e21\u0e18\u0e23\u0e23\u0e21\u0e4c=xxxxx-69100/\u0e23\u0e22/xxxxxx, \u0e23\u0e31\u0e1a\u0e41\u0e08\u0e49\u0e07=W, \u0e2a\u0e25\u0e31\u0e01\u0e2b\u0e25\u0e31\u0e07=E
function makeDocNo(typeIdx: number, k: number): string {
  const w = String((k * 13) % 100000).padStart(5, "0");
  switch (typeIdx) {
    case 0:
      return `${String((k * 3) % 100000).padStart(5, "0")}-69100/\u0e23\u0e22/${String((k * 7) % 1000000).padStart(6, "0")}`;
    case 1:
      return `69108/\u0e01\u0e18/W${w}`;
    default:
      return `69108/\u0e01\u0e18/E${w}`;
  }
}

export interface PolicyItem {
  seq: number;
  docNo: string;
  docType: string;
  insuredName: string;
  netPremium: number;   // \u0e40\u0e1a\u0e35\u0e49\u0e22\u0e2a\u0e38\u0e17\u0e18\u0e34
  grossPremium: number; // \u0e40\u0e1a\u0e35\u0e49\u0e22\u0e23\u0e27\u0e21 = \u0e22\u0e2d\u0e14\u0e0a\u0e33\u0e23\u0e30 (\u0e2a\u0e48\u0e27\u0e19\u0e25\u0e14 0)
  discount: number;
  ref: string;
}
/** \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e01\u0e23\u0e21\u0e18\u0e23\u0e23\u0e21\u0e4c\u0e17\u0e35\u0e48\u0e08\u0e30\u0e23\u0e31\u0e1a\u0e0a\u0e33\u0e23\u0e30 \u2014 derive deterministic; grossPremium \u0e04\u0e07\u0e04\u0e48\u0e32 (\u0e23\u0e27\u0e21 = t.amount), netPremium = 70% \u0e02\u0e2d\u0e07 gross. */
export function policyItems(t: Transaction): PolicyItem[] {
  const s = seedOf(t);
  return t.items.map((it, i) => {
    const k = s + i * 17;
    const typeIdx = k % 3;
    return {
      seq: i + 1,
      docNo: makeDocNo(typeIdx, k),
      docType: DOC_TYPES[typeIdx] ?? "เลขกรมธรรม์",
      insuredName: INSURED_NAMES[k % INSURED_NAMES.length] ?? "อาภัสรา ภาสกรพันธุ์",
      netPremium: Math.round(it.amount * 0.7 * 100) / 100,
      grossPremium: it.amount,
      discount: 0,
      ref: `${REF_PREFIX[k % REF_PREFIX.length] ?? "นบ"} ${(k * 7) % 10000}`,
    };
  });
}

// \u2500\u2500 payment lifecycle (Authorize \u2192 Capture \u2192 Settled) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export type StepState = "done" | "current" | "pending" | "failed";
export interface LifecycleStep {
  label: string;
  state: StepState;
}
export function paymentLifecycle(status: TransactionStatus): LifecycleStep[] {
  const labels = ["Authorize", "Capture", "Settled"] as const;
  const mk = (a: StepState, b: StepState, c: StepState): LifecycleStep[] => [
    { label: labels[0], state: a },
    { label: labels[1], state: b },
    { label: labels[2], state: c },
  ];
  switch (status) {
    case "completed":
      return mk("done", "done", "done");
    case "refunded":
      return mk("done", "done", "done");
    case "processing":
      return mk("done", "current", "pending");
    case "pending":
      return mk("current", "pending", "pending");
    case "failed":
      return mk("failed", "pending", "pending");
    case "cancelled":
      return mk("pending", "pending", "pending");
  }
}

// \u2500\u2500 timeline \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export type TimelineIcon =
  | "webhook" | "bank" | "capture" | "auth" | "redirect" | "link" | "refund" | "cancel";
export interface TimelineEvent {
  key: string;
  title: string;
  desc: string;
  time: string; // HH:MM:SS
  tone: "ok" | "info" | "error" | "muted";
  icon: TimelineIcon;
}

/** HH:MM + offset \u0e27\u0e34\u0e19\u0e32\u0e17\u0e35 -> HH:MM:SS (wrap 24h, \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e49 Date). */
function hms(base: string, offsetSec: number): string {
  const parts = base.split(":").map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  let total = (h * 3600 + m * 60 + offsetSec) % 86400;
  if (total < 0) total += 86400;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(total / 3600))}:${p(Math.floor((total % 3600) / 60))}:${p(total % 60)}`;
}

export function buildTimeline(t: Transaction): TimelineEvent[] {
  const psp = PSP_LABEL[t.psp];
  const amt = `\u0e3f${t.amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const open: TimelineEvent = { key: "open", icon: "link", tone: "info", title: "\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32\u0e40\u0e1b\u0e34\u0e14\u0e25\u0e34\u0e07\u0e01\u0e4c", desc: `\u0e08\u0e32\u0e01 SMS \u0e17\u0e35\u0e48\u0e2a\u0e48\u0e07\u0e44\u0e1b\u0e22\u0e31\u0e07 ${customerPhone(t)}`, time: hms(t.time, 0) };
  const redirect: TimelineEvent = { key: "redirect", icon: "redirect", tone: "info", title: "\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32\u0e40\u0e23\u0e34\u0e48\u0e21\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19", desc: `Redirect \u0e44\u0e1b Hosted Payment Page (${psp})`, time: hms(t.time, 36) };
  const authOk: TimelineEvent = { key: "auth", icon: "auth", tone: "ok", title: "Authorize \u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08", desc: "\u0e2d\u0e19\u0e38\u0e21\u0e31\u0e15\u0e34\u0e27\u0e07\u0e40\u0e07\u0e34\u0e19\u0e08\u0e32\u0e01\u0e18\u0e19\u0e32\u0e04\u0e32\u0e23\u0e1c\u0e39\u0e49\u0e2d\u0e2d\u0e01\u0e1a\u0e31\u0e15\u0e23", time: hms(t.time, 42) };
  const authFail: TimelineEvent = { key: "auth", icon: "auth", tone: "error", title: "Authorize \u0e25\u0e49\u0e21\u0e40\u0e2b\u0e25\u0e27", desc: "\u0e18\u0e19\u0e32\u0e04\u0e32\u0e23\u0e1c\u0e39\u0e49\u0e2d\u0e2d\u0e01\u0e1a\u0e31\u0e15\u0e23\u0e1b\u0e0f\u0e34\u0e40\u0e2a\u0e18\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23", time: hms(t.time, 42) };
  const capture: TimelineEvent = { key: "capture", icon: "capture", tone: "ok", title: "Capture \u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08", desc: `\u0e40\u0e01\u0e47\u0e1a\u0e22\u0e2d\u0e14 ${amt} \u0e08\u0e32\u0e01 ${psp}`, time: hms(t.time, 46) };
  const settled: TimelineEvent = { key: "settled", icon: "bank", tone: "ok", title: "Settled", desc: "\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19\u0e40\u0e02\u0e49\u0e32\u0e1a\u0e31\u0e0d\u0e0a\u0e35\u0e15\u0e31\u0e27\u0e01\u0e25\u0e32\u0e07 (\u0e23\u0e2d\u0e1a T+2)", time: hms(t.time, 50) };
  const webhook: TimelineEvent = { key: "webhook", icon: "webhook", tone: "ok", title: "\u0e2a\u0e48\u0e07 Webhook \u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08", desc: "payment.succeeded \u2192 policy-core", time: hms(t.time, 56) };
  const refund: TimelineEvent = { key: "refund", icon: "refund", tone: "muted", title: "\u0e04\u0e37\u0e19\u0e40\u0e07\u0e34\u0e19\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08", desc: `\u0e04\u0e37\u0e19\u0e22\u0e2d\u0e14 ${amt} \u0e01\u0e25\u0e31\u0e1a\u0e1a\u0e31\u0e15\u0e23\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32`, time: hms(t.time, 120) };
  const cancel: TimelineEvent = { key: "cancel", icon: "cancel", tone: "muted", title: "\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23", desc: "\u0e25\u0e34\u0e07\u0e01\u0e4c\u0e2b\u0e21\u0e14\u0e2d\u0e32\u0e22\u0e38 / \u0e22\u0e01\u0e40\u0e25\u0e34\u0e01\u0e01\u0e48\u0e2d\u0e19\u0e0a\u0e33\u0e23\u0e30", time: hms(t.time, 30) };

  switch (t.status) {
    case "completed":
      return [webhook, settled, capture, authOk, redirect, open];
    case "refunded":
      return [refund, webhook, settled, capture, authOk, redirect, open];
    case "processing":
      return [authOk, redirect, open];
    case "pending":
      return [open];
    case "failed":
      return [authFail, redirect, open];
    case "cancelled":
      return [cancel, open];
  }
}

// \u2500\u2500 action bar (mock \u2014 \u0e1b\u0e38\u0e48\u0e21\u0e40\u0e1b\u0e47\u0e19 affordance, \u0e44\u0e21\u0e48\u0e40\u0e23\u0e35\u0e22\u0e01 backend) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export type ActionVariant = "primary" | "outline" | "disabled";
export type ActionIcon = "capture" | "void" | "refund" | "receipt" | "resend";
export interface ActionDef {
  key: string;
  label: string;
  icon: ActionIcon;
  variant: ActionVariant;
}
export function transactionActions(status: TransactionStatus): ActionDef[] {
  const captured = status === "completed" || status === "refunded";
  const authorizedOnly = status === "processing" || status === "pending";
  return [
    { key: "capture", label: "Capture", icon: "capture", variant: status === "processing" ? "outline" : "disabled" },
    { key: "void", label: "Void", icon: "void", variant: authorizedOnly ? "outline" : "disabled" },
    { key: "refund", label: "Refund", icon: "refund", variant: status === "completed" ? "primary" : "disabled" },
    { key: "receipt", label: "\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08", icon: "receipt", variant: captured ? "outline" : "disabled" },
    { key: "resend", label: "\u0e2a\u0e48\u0e07\u0e0b\u0e49\u0e33", icon: "resend", variant: "outline" },
  ];
}
