import type { PaymentSession, PaymentSessionStatus, PaymentChannel, Psp } from "@/types/order-payment";
import { PAYMENT_SESSIONS } from "@/lib/mock/transactions";
import { formatMoney } from "@/types/money";

export const PAYMENT_SESSION_STATUS_LABEL: Record<PaymentSessionStatus, string> = {
  Created: "รอชำระ", Redirected: "กำลังประมวลผล", Paid: "สำเร็จ",
  Failed: "ล้มเหลว", Expired: "หมดอายุ",
};
// pill styles — follow existing token families (see src/components/user/user-table-columns.tsx statusStyles)
export const PAYMENT_SESSION_STATUS_STYLE: Record<PaymentSessionStatus, string> = {
  Created: "bg-warning/16 text-warning-dark",
  Redirected: "bg-info/16 text-info-dark",
  Paid: "bg-success/16 text-success-dark",
  Failed: "bg-error/16 text-error-dark",
  Expired: "bg-grey-500/16 text-grey-600",
};
// dot color before status label inside the pill
export const PAYMENT_SESSION_STATUS_DOT: Record<PaymentSessionStatus, string> = {
  Created: "bg-warning", Redirected: "bg-info", Paid: "bg-success",
  Failed: "bg-error", Expired: "bg-grey-500",
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
// failed/expired use the tone to color the active/last dot.
export function lifecycleStage(status: PaymentSessionStatus): { done: number; active: number; tone: "ok" | "error" | "muted" } {
  switch (status) {
    case "Created": return { done: 0, active: 1, tone: "ok" };
    case "Redirected": return { done: 2, active: 1, tone: "ok" };
    case "Paid": return { done: 4, active: 0, tone: "ok" };
    case "Failed": return { done: 1, active: 1, tone: "error" };
    case "Expired": return { done: 0, active: 0, tone: "muted" };
  }
}

export function getTransactionById(id: string | undefined): PaymentSession | undefined {
  if (!id) return undefined;
  return PAYMENT_SESSIONS.find((t) => t.id === id || t.code === id);
}

// CSV export (client-side). header ไทย.
export function toCsv(rows: PaymentSession[]): string {
  const head = ["รหัสธุรกรรม", "อีเมล", "ที่มา", "ช่องทาง", "PSP", "จำนวน", "สถานะ", "เวลา"];
  const esc = (v: string) => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  const body = rows.map((t) => [
    t.code, t.recipientEmail ?? "", `${t.source.code} ${t.source.label}`,
    CHANNEL_LABEL[t.channel], PSP_LABEL[t.psp], formatMoney(t.amount), PAYMENT_SESSION_STATUS_LABEL[t.status], t.time,
  ].map((c) => esc(String(c))).join(","));
  return [head.join(","), ...body].join("\n");
}

export function downloadCsv(filename: string, rows: PaymentSession[]): void {
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── หน้า detail: derive ข้อมูลนำเสนอจาก transaction ──────────────────────────
// เก็บใน mock จะบวมทั้ง 48 แถว → derive แบบ deterministic จากรหัส (เสถียรข้าม render,
// ไม่ใช้ Math.random/Date เพื่อกัน hydration mismatch). amount/total คงค่าจริงจาก mock.

function seedOf(t: PaymentSession): number {
  const n = Number(t.code.replace(/\D/g, "").slice(-6));
  return Number.isFinite(n) ? n : 0;
}

/** เบอร์โทรลูกค้า (mock) — deterministic จากรหัสธุรกรรม. */
export function customerPhone(t: PaymentSession): string {
  const s = seedOf(t);
  const a = (s % 9) + 1;
  const b = String(100 + ((s * 7) % 900));
  const c = String(1000 + ((s * 13) % 9000));
  return `08${a}-${b}-${c}`;
}

/** ลิงก์ชำระเงิน (mock) — short code + url, deterministic จากรหัสธุรกรรม. */
export function payLink(t: PaymentSession): { code: string; url: string } {
  const s = seedOf(t);
  const code = ((s * 2654435761) % 0x7fffffff).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return { code, url: `pay.cpg.co/${code}` };
}

const BRANCHES = [
  { code: "KKC", label: "สาขาขอนแก่น" },
  { code: "BKK", label: "สาขากรุงเทพ" },
  { code: "CMI", label: "สาขาเชียงใหม่" },
  { code: "HDY", label: "สาขาหาดใหญ่" },
];
const SOURCE_ROLES = [
  "พนักงานประจำสาขา",
  "ตัวแทนอิสระ",
  "นายหน้านิติบุคคล",
  "พนักงานขายตรง",
];

export interface SourceDetail {
  role: string;
  location: string;
  branchCode: string;
  branchLabel: string;
  linkRef: string;
}
export function sourceDetail(t: PaymentSession): SourceDetail {
  const s = seedOf(t);
  const branch = BRANCHES[s % BRANCHES.length] ?? { code: "KKC", label: "สาขาขอนแก่น" };
  return {
    role: SOURCE_ROLES[s % SOURCE_ROLES.length] ?? "พนักงานประจำสาขา",
    location: branch.label.replace("สาขา", ""),
    branchCode: branch.code,
    branchLabel: branch.label,
    linkRef: `PLK-${String(50000 + (s - 100000)).padStart(6, "0")}`,
  };
}

const INSURED_NAMES = [
  "อาภัสรา ภาสกรพันธุ์",
  "ธนกฤต วโรดม",
  "พิมพ์ชนก ไพศาล",
  "ณัฐวุฒิ แสงทอง",
  "ชนิกานต์ บุญมี",
  "ปิยะพงษ์ ศรีสุข",
  "วรรณวิสา จันทร์เพ็ญ",
  "กิตติพงศ์ รักษาวงศ์",
];
const DOC_TYPES = ["เลขกรมธรรม์", "เลขรับแจ้ง", "เลขสลักหลัง"] as const;
const REF_PREFIX = ["นบ", "กข", "ฉง", "พล", "ชม"];

// เลขเอกสารตามประเภท (mock): กรมธรรม์=xxxxx-69100/รย/xxxxxx, รับแจ้ง=W, สลักหลัง=E
function makeDocNo(typeIdx: number, k: number): string {
  const w = String((k * 13) % 100000).padStart(5, "0");
  switch (typeIdx) {
    case 0:
      return `${String((k * 3) % 100000).padStart(5, "0")}-69100/รย/${String((k * 7) % 1000000).padStart(6, "0")}`;
    case 1:
      return `69108/กธ/W${w}`;
    default:
      return `69108/กธ/E${w}`;
  }
}

export interface PolicyItem {
  seq: number;
  docNo: string;
  docType: string;
  insuredName: string;
  netPremium: number;   // เบี้ยสุทธิ
  grossPremium: number; // เบี้ยรวม = ยอดชำระ (ส่วนลด 0)
  discount: number;
  ref: string;
}
/** รายการกรมธรรม์ที่จะรับชำระ — derive deterministic; grossPremium คงค่า (รวม = t.amount), netPremium = 70% ของ gross. */
export function policyItems(t: PaymentSession): PolicyItem[] {
  const s = seedOf(t);
  return t.items.map((it, i) => {
    const k = s + i * 17;
    const typeIdx = k % 3;
    const grossPremium = Number(it.amount.amount);
    return {
      seq: i + 1,
      docNo: makeDocNo(typeIdx, k),
      docType: DOC_TYPES[typeIdx] ?? "เลขกรมธรรม์",
      insuredName: INSURED_NAMES[k % INSURED_NAMES.length] ?? "อาภัสรา ภาสกรพันธุ์",
      netPremium: Math.round(grossPremium * 0.7 * 100) / 100,
      grossPremium,
      discount: 0,
      ref: `${REF_PREFIX[k % REF_PREFIX.length] ?? "นบ"} ${(k * 7) % 10000}`,
    };
  });
}

// ── payment lifecycle (Authorize → Capture → Settled) ────────────────────────
export type StepState = "done" | "current" | "pending" | "failed";
export interface LifecycleStep {
  label: string;
  state: StepState;
}
export function paymentLifecycle(status: PaymentSessionStatus): LifecycleStep[] {
  const labels = ["Authorize", "Capture", "Settled"] as const;
  const mk = (a: StepState, b: StepState, c: StepState): LifecycleStep[] => [
    { label: labels[0], state: a },
    { label: labels[1], state: b },
    { label: labels[2], state: c },
  ];
  switch (status) {
    case "Created":
      return mk("current", "pending", "pending");
    case "Redirected":
      return mk("done", "current", "pending");
    case "Paid":
      return mk("done", "done", "done");
    case "Failed":
      return mk("failed", "pending", "pending");
    case "Expired":
      return mk("pending", "pending", "pending");
  }
}

// ── timeline ───────────────────────────────────────────────────────────────
export type TimelineIcon =
  | "webhook" | "bank" | "capture" | "auth" | "redirect" | "link" | "cancel";
export interface TimelineEvent {
  key: string;
  title: string;
  desc: string;
  time: string; // HH:MM:SS
  tone: "ok" | "info" | "error" | "muted";
  icon: TimelineIcon;
}

/** HH:MM + offset วินาที -> HH:MM:SS (wrap 24h, ไม่ใช้ Date). */
function hms(base: string, offsetSec: number): string {
  const parts = base.split(":").map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  let total = (h * 3600 + m * 60 + offsetSec) % 86400;
  if (total < 0) total += 86400;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(total / 3600))}:${p(Math.floor((total % 3600) / 60))}:${p(total % 60)}`;
}

export function buildTimeline(t: PaymentSession): TimelineEvent[] {
  const psp = PSP_LABEL[t.psp];
  const amt = formatMoney(t.amount);
  const open: TimelineEvent = { key: "open", icon: "link", tone: "info", title: "ลูกค้าเปิดลิงก์", desc: `จาก SMS ที่ส่งไปยัง ${customerPhone(t)}`, time: hms(t.time, 0) };
  const redirect: TimelineEvent = { key: "redirect", icon: "redirect", tone: "info", title: "ลูกค้าเริ่มชำระเงิน", desc: `Redirect ไป Hosted Payment Page (${psp})`, time: hms(t.time, 36) };
  const authOk: TimelineEvent = { key: "auth", icon: "auth", tone: "ok", title: "Authorize สำเร็จ", desc: "อนุมัติวงเงินจากธนาคารผู้ออกบัตร", time: hms(t.time, 42) };
  const authFail: TimelineEvent = { key: "auth", icon: "auth", tone: "error", title: "Authorize ล้มเหลว", desc: "ธนาคารผู้ออกบัตรปฏิเสธรายการ", time: hms(t.time, 42) };
  const capture: TimelineEvent = { key: "capture", icon: "capture", tone: "ok", title: "Capture สำเร็จ", desc: `เก็บยอด ${amt} จาก ${psp}`, time: hms(t.time, 46) };
  const settled: TimelineEvent = { key: "settled", icon: "bank", tone: "ok", title: "Settled", desc: "รับเงินเข้าบัญชีตัวกลาง (รอบ T+2)", time: hms(t.time, 50) };
  const webhook: TimelineEvent = { key: "webhook", icon: "webhook", tone: "ok", title: "ส่ง Webhook สำเร็จ", desc: "payment.succeeded → policy-core", time: hms(t.time, 56) };
  const cancel: TimelineEvent = { key: "cancel", icon: "cancel", tone: "muted", title: "ยกเลิกรายการ", desc: "ลิงก์หมดอายุ / ยกเลิกก่อนชำระ", time: hms(t.time, 30) };

  switch (t.status) {
    case "Paid":
      return [webhook, settled, capture, authOk, redirect, open];
    case "Redirected":
      return [authOk, redirect, open];
    case "Created":
      return [open];
    case "Failed":
      return [authFail, redirect, open];
    case "Expired":
      return [cancel, open];
  }
}

// ── action bar (mock — ปุ่มเป็น affordance, ไม่เรียก backend) ──────────────────
export type ActionVariant = "primary" | "outline" | "disabled";
export type ActionIcon = "capture" | "void" | "refund" | "receipt" | "resend";
export interface ActionDef {
  key: string;
  label: string;
  icon: ActionIcon;
  variant: ActionVariant;
}
export function transactionActions(status: PaymentSessionStatus): ActionDef[] {
  const captured = status === "Paid";
  const authorizedOnly = status === "Redirected" || status === "Created";
  return [
    { key: "capture", label: "Capture", icon: "capture", variant: status === "Redirected" ? "outline" : "disabled" },
    { key: "void", label: "Void", icon: "void", variant: authorizedOnly ? "outline" : "disabled" },
    { key: "refund", label: "Refund", icon: "refund", variant: captured ? "primary" : "disabled" },
    { key: "receipt", label: "ใบเสร็จ", icon: "receipt", variant: captured ? "outline" : "disabled" },
    { key: "resend", label: "ส่งซ้ำ", icon: "resend", variant: "outline" },
  ];
}
