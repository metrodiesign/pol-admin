import type { Order, OrderStatus, PaymentSession } from "@/types/order-payment";
import { ORDERS } from "@/lib/mock/orders";
import {
  CHANNEL_LABEL, CHANNEL_DOT, PSP_LABEL,
  getTransactionById,
  customerPhone as sessionCustomerPhone,
  payLink as sessionPayLink,
  sourceDetail as sessionSourceDetail,
  policyItems as sessionPolicyItems,
  buildTimeline as sessionBuildTimeline,
  type SourceDetail,
  type PolicyItem,
  type TimelineEvent,
  type TimelineIcon,
} from "@/lib/transaction";
import { formatMoney } from "@/types/money";

export { CHANNEL_LABEL, CHANNEL_DOT, PSP_LABEL };
export type { SourceDetail, PolicyItem, TimelineEvent, TimelineIcon };

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  AwaitingPayment: "รอชำระ", Paid: "สำเร็จ", Cancelled: "ยกเลิก",
};
// pill styles — follow existing token families (see src/components/user/user-table-columns.tsx statusStyles)
export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  AwaitingPayment: "bg-warning/16 text-warning-dark",
  Paid: "bg-success/16 text-success-dark",
  Cancelled: "bg-grey-500/16 text-grey-600",
};
// dot color before status label inside the pill
export const ORDER_STATUS_DOT: Record<OrderStatus, string> = {
  AwaitingPayment: "bg-warning", Paid: "bg-success", Cancelled: "bg-grey-500",
};

// 4-dot lifecycle stepper state. done = filled green, active = current (blue), rest empty.
export function lifecycleStage(status: OrderStatus): { done: number; active: number; tone: "ok" | "error" | "muted" } {
  switch (status) {
    case "AwaitingPayment": return { done: 0, active: 1, tone: "ok" };
    case "Paid": return { done: 4, active: 0, tone: "ok" };
    case "Cancelled": return { done: 0, active: 0, tone: "muted" };
  }
}

/**
 * Order (REQ-8) มีแค่ id/amount/status/paymentSessionId — UI เดิมโชว์ channel/psp/customerEmail/
 * items/time/code ซึ่งอยู่บน PaymentSession เท่านั้น เลย join ผ่าน paymentSessionId ที่ชั้น UI
 * (mock/UI-only, ไม่มีบน Order type จริง) เพื่อคง UX เดิมโดยไม่ฝ่าฝืน REQ-8 shape.
 */
export interface OrderRow extends Order {
  session: PaymentSession | undefined;
}

export const ORDER_ROWS: OrderRow[] = ORDERS.map((o) => ({
  ...o,
  session: getTransactionById(o.paymentSessionId ?? undefined),
}));

export function getOrderById(id: string | undefined): OrderRow | undefined {
  if (!id) return undefined;
  return ORDER_ROWS.find((o) => o.id === id || o.session?.code === id);
}

// CSV export (client-side). header ไทย.
export function toCsv(rows: OrderRow[]): string {
  const head = ["รหัสคำสั่งซื้อ", "อีเมล", "ที่มา", "ช่องทาง", "PSP", "จำนวน", "สถานะ", "เวลา"];
  const esc = (v: string) => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  const body = rows.map((o) => [
    o.session?.code ?? o.id,
    o.session?.recipientEmail ?? "",
    o.session ? `${o.session.source.code} ${o.session.source.label}` : "",
    o.session ? CHANNEL_LABEL[o.session.channel] : "",
    o.session ? PSP_LABEL[o.session.psp] : "",
    formatMoney(o.amount),
    ORDER_STATUS_LABEL[o.status],
    o.session?.time ?? "",
  ].map((c) => esc(String(c))).join(","));
  return [head.join(","), ...body].join("\n");
}

export function downloadCsv(filename: string, rows: OrderRow[]): void {
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── detail helpers: delegate ไปหา PaymentSession ที่ผูกไว้ (join ผ่าน paymentSessionId) ──────
export function customerPhone(o: OrderRow): string {
  return o.session ? sessionCustomerPhone(o.session) : "-";
}
export function payLink(o: OrderRow): { code: string; url: string } {
  return o.session ? sessionPayLink(o.session) : { code: "-", url: "-" };
}
export function sourceDetail(o: OrderRow): SourceDetail | undefined {
  return o.session ? sessionSourceDetail(o.session) : undefined;
}
export function policyItems(o: OrderRow): PolicyItem[] {
  return o.session ? sessionPolicyItems(o.session) : [];
}
export function buildTimeline(o: OrderRow): TimelineEvent[] {
  return o.session ? sessionBuildTimeline(o.session) : [];
}

// ── payment lifecycle (Authorize → Capture → Settled), 3-value OrderStatus ──────────────────
export type StepState = "done" | "current" | "pending" | "failed";
export interface LifecycleStep {
  label: string;
  state: StepState;
}
export function paymentLifecycle(status: OrderStatus): LifecycleStep[] {
  const labels = ["อนุมัติวงเงิน", "เรียกเก็บเงิน", "ชำระเงินสำเร็จ"] as const;
  const mk = (a: StepState, b: StepState, c: StepState): LifecycleStep[] => [
    { label: labels[0], state: a },
    { label: labels[1], state: b },
    { label: labels[2], state: c },
  ];
  switch (status) {
    case "AwaitingPayment":
      return mk("current", "pending", "pending");
    case "Paid":
      return mk("done", "done", "done");
    case "Cancelled":
      return mk("pending", "pending", "pending");
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
export function orderActions(status: OrderStatus): ActionDef[] {
  const captured = status === "Paid";
  const authorizedOnly = status === "AwaitingPayment";
  return [
    { key: "capture", label: "Capture", icon: "capture", variant: authorizedOnly ? "outline" : "disabled" },
    { key: "void", label: "Void", icon: "void", variant: authorizedOnly ? "outline" : "disabled" },
    { key: "refund", label: "Refund", icon: "refund", variant: captured ? "primary" : "disabled" },
    { key: "receipt", label: "ใบเสร็จ", icon: "receipt", variant: captured ? "outline" : "disabled" },
    { key: "resend", label: "ส่งซ้ำ", icon: "resend", variant: "outline" },
  ];
}
