"use client";

import Link from "next/link";
import SimpleBar from "simplebar-react";
import QRCode from "react-qr-code";
import {
  type LucideIcon,
  Ban,
  Send,
  ShieldCheck,
  Webhook,
  Landmark,
  CircleDollarSign,
  ExternalLink,
  Phone,
  Mail,
  Download,
  Copy,
  Clock,
  Info,
  MessageSquare,
} from "lucide-react";
import {
  getOrderById,
  buildTimeline,
  policyItems,
  sourceDetail,
  customerPhone,
  payLink,
  type TimelineIcon,
} from "@/lib/order";
import { cn, formatAmount } from "@/lib/utils";
import { formatMoney } from "@/types/money";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./order-status-badge";

const TIMELINE_ICON: Record<TimelineIcon, LucideIcon> = {
  webhook: Webhook,
  bank: Landmark,
  capture: CircleDollarSign,
  auth: ShieldCheck,
  redirect: ExternalLink,
  link: Phone,
  cancel: Ban,
};

const TONE_TEXT = {
  ok: "text-success",
  info: "text-info",
  error: "text-error",
  muted: "text-grey-500",
} as const;
const TONE_BG = {
  ok: "bg-success/12",
  info: "bg-info/12",
  error: "bg-error/12",
  muted: "bg-grey-500/12",
} as const;

const CHANNEL_DISPLAY: Record<string, { img: string; label: string; caption: string }> = {
  card: {
    img: "/payment/credit-card-v2.png",
    label: "บัตรเครดิต/เดบิต",
    caption: "Visa, Mastercard, JCB ทุกธนาคาร",
  },
  promptpay: {
    img: "/payment/promptpay-qr-v2.png",
    label: "พร้อมเพย์",
    caption: "สแกน QR จ่ายผ่านแอปธนาคาร",
  },
  installment: {
    img: "/payment/installment-v2.png",
    label: "ผ่อนชำระ",
    caption: "ผ่อน 0% สูงสุด 10 เดือน",
  },
};

function Panel({
  className,
  title,
  description,
  children,
}: {
  className?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("rounded-2xl bg-card", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {title ? (
        <>
          <div className="px-6 py-5">
            <p className="text-base font-bold text-primary">{title}</p>
            {description ? (
              <p className="mt-0.5 text-xs text-grey-500">{description}</p>
            ) : null}
          </div>
          <div className="border-t border-[var(--divider)]" />
        </>
      ) : null}
      {children}
    </section>
  );
}

const fieldLabel = "mb-1.5 block text-xs font-semibold text-grey-700";

export function OrderDetailView({ id, compact = false }: { id: string | undefined; compact?: boolean }) {
  const t = getOrderById(id);

  if (!t) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card px-6 py-16 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-base font-bold text-foreground">ไม่พบรายการชำระเงิน</p>
        <Button
          render={<Link href="/order/list" />}
          nativeButton={false}
          className="mt-1 h-10 bg-grey-800 px-5 font-bold text-white hover:bg-grey-900"
        >
          กลับไปหน้ารายการ
        </Button>
      </div>
    );
  }

  const items = policyItems(t);
  const src = sourceDetail(t);
  const timeline = buildTimeline(t);
  const link = payLink(t);
  const sessionChannel = t.session?.channel;
  const channel = sessionChannel ? CHANNEL_DISPLAY[sessionChannel] : undefined;

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* ── 1. สถานะลิงก์และชำระเงิน + ไทม์ไลน์ (2 คอลัมน์) ─────────────────── */}
      <div className={cn("grid grid-cols-1 gap-6", !compact && "mmd:grid-cols-2")}>
      <Panel title="สถานะลิงก์และชำระเงิน">
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-foreground">สถานะ</p>
            <OrderStatusBadge status={t.status} />
          </div>

          <div className={cn("mt-6 grid grid-cols-1 gap-x-8 gap-y-8", !compact && "mmd:grid-cols-2")}>
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-grey-100 px-6 py-7">
              <QRCode value={link.url} size={220} />
            </div>

            <div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-info/12 px-4 text-sm font-bold text-info transition-colors hover:bg-info/16"
                >
                  <Send className="size-4" />
                  ส่งลิงก์อีกครั้ง
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-warning/12 px-4 text-sm font-bold text-warning-dark transition-colors hover:bg-warning/16"
                >
                  <Clock className="size-4" />
                  ต่ออายุลิงก์
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-error/12 px-4 text-sm font-bold text-error transition-colors hover:bg-error/16"
                >
                  <Ban className="size-4" />
                  ยกเลิกลิงก์
                </button>
              </div>

              <div className={cn("mt-4 grid gap-2.5", compact ? "grid-cols-1" : "grid-cols-2")}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-success px-3 text-sm font-bold text-white transition-colors hover:bg-success-dark",
                    !compact && "col-span-2",
                  )}
                >
                  <ExternalLink className="size-4 shrink-0" />
                  เปิดลิงก์
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-[var(--divider)] px-3 text-sm font-bold text-foreground transition-colors hover:bg-grey-100"
                >
                  <Download className="size-4 shrink-0" />
                  ดาวน์โหลด QR
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-[var(--divider)] px-3 text-sm font-bold text-foreground transition-colors hover:bg-grey-100"
                >
                  <Copy className="size-4 shrink-0" />
                  คัดลอกลิงก์
                </button>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="px-6 py-5">
          <h2 className="text-base font-bold text-primary">ประวัติการดำเนินงาน</h2>
        </div>
        <div className="border-t border-[var(--divider)]" />
        <div className="py-5">
          <SimpleBar className="max-h-[335px]" autoHide={false}>
            <ol className="flex flex-col px-6">
              {timeline.map((ev, i) => {
                const Icon = TIMELINE_ICON[ev.icon];
                const last = i === timeline.length - 1;
                return (
                  <li key={ev.key} className="relative flex gap-3 pb-6 last:pb-0">
                    {!last ? (
                      <span className="absolute top-9 left-4 h-[calc(100%-2.5rem)] w-px bg-[var(--divider)]" />
                    ) : null}
                    <span
                      className={cn(
                        "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                        TONE_BG[ev.tone],
                        TONE_TEXT[ev.tone],
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">{ev.title}</p>
                        <span className="shrink-0 text-xs tabular-nums text-grey-500">
                          {ev.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-grey-500">{ev.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </SimpleBar>
        </div>
      </Panel>
      </div>

      {/* ── 2. ข้อมูลคำสั่งซื้อ (Advanced) ─────────────────────── */}
      <Panel title="ข้อมูลคำสั่งซื้อ">
        <div className="px-6 py-5">
          <div className={cn("grid grid-cols-1 gap-x-4 gap-y-4", !compact && "sm:grid-cols-2")}>
            <div>
              <p className={fieldLabel}>หมายเลขคำสั่งซื้อ</p>
              <p className="text-sm font-bold text-foreground">{t.id}</p>
            </div>
          </div>
          <div className={cn("mt-4 grid grid-cols-1 gap-x-4 gap-y-4", !compact && "sm:grid-cols-2")}>
            <div>
              <p className={fieldLabel}>หมายเลขอ้างอิง 1</p>
              <p className="text-sm font-bold text-foreground">{t.session?.source.code || <span className="text-grey-400">—</span>}</p>
            </div>
            <div>
              <p className={fieldLabel}>หมายเลขอ้างอิง 2</p>
              <p className="text-sm font-bold text-foreground">{t.session?.source.label || <span className="text-grey-400">—</span>}</p>
            </div>
            <div>
              <p className={fieldLabel}>หมายเลขอ้างอิง 3</p>
              <p className="text-sm font-bold text-foreground">{src ? `${src.role} · ${src.location}` : <span className="text-grey-400">—</span>}</p>
            </div>
            <div>
              <p className={fieldLabel}>หมายเลขอ้างอิง 4</p>
              <p className="text-sm font-bold text-foreground">{src ? `${src.branchCode} · ${src.branchLabel}` : <span className="text-grey-400">—</span>}</p>
            </div>
            <div>
              <p className={fieldLabel}>หมายเลขอ้างอิง 5</p>
              <p className="text-sm font-bold text-foreground">{src?.linkRef || <span className="text-grey-400">—</span>}</p>
            </div>
          </div>
        </div>
      </Panel>

      {/* ── 2. ข้อมูลลูกค้า (Customer) ──────────────────────────────────────── */}
      <Panel title="ข้อมูลลูกค้า">
        <div className="px-6 py-5">
          <div className={cn("grid grid-cols-1 gap-x-5 gap-y-5", !compact && "mmd:grid-cols-2")}>
            <div className="flex flex-col gap-1.5">
              <p className={fieldLabel}>ชื่อ-นามสกุล</p>
              <p className="text-sm font-bold text-foreground">{t.session?.source.label || <span className="text-grey-400">—</span>}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className={fieldLabel}>อีเมล</p>
              <p className="text-sm font-bold text-foreground">{t.session?.recipientEmail || <span className="text-grey-400">—</span>}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className={fieldLabel}>เบอร์โทรศัพท์</p>
              <p className="text-sm font-bold text-foreground">{customerPhone(t) || <span className="text-grey-400">—</span>}</p>
            </div>
          </div>
        </div>
      </Panel>

      {/* ── 3. รายการกรมธรรม์ (Items) ───────────────────────────── */}
      <Panel title="รายการกรมธรรม์">
        <div className="px-6 py-5">
          <div className="-mx-6 overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse">
              <thead>
                <tr className="bg-grey-200 text-sm font-semibold text-grey-600 dark:bg-grey-900">
                  <th className="whitespace-nowrap py-4 pr-4 pl-6 text-left">ลำดับ</th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">
                    หมายเลขกรมธรรม์ / รับแจ้ง / สลักหลัง
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">ชื่อ-นามสกุล</th>
                  <th className="whitespace-nowrap px-4 py-4 text-right">เบี้ยสุทธิ</th>
                  <th className="whitespace-nowrap px-4 py-4 text-right">เบี้ยรวม</th>
                  <th className="whitespace-nowrap px-4 py-4 text-right">ส่วนลด</th>
                  <th className="whitespace-nowrap px-4 py-4 text-right">%จากเบี้ยสุทธิ</th>
                  <th className="whitespace-nowrap px-4 py-4 text-right">ยอดชำระ</th>
                  <th className="whitespace-nowrap py-4 pr-6 pl-4 text-left">
                    ข้อมูลอ้างอิง
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it.seq}
                    className="border-b border-dashed border-[var(--divider)] align-top text-sm"
                  >
                    <td className="py-4 pr-3 pl-6 text-grey-600">{it.seq}</td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-primary">{it.docNo}</p>
                      <p className="mt-0.5 text-xs text-grey-500">{it.docType}</p>
                    </td>
                    <td className="px-3 py-4 text-foreground">{it.insuredName}</td>
                    <td className="px-3 py-4 text-right tabular-nums text-foreground">
                      {formatAmount(it.netPremium, 2)}
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums text-foreground">
                      {formatAmount(it.grossPremium, 2)}
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums text-grey-600">
                      {it.discount}
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums text-grey-500">0.00%</td>
                    <td className="px-3 py-4 text-right font-semibold tabular-nums text-foreground">
                      {formatAmount(it.grossPremium, 2)}
                    </td>
                    <td className="py-4 pr-6 pl-3 text-grey-600">{it.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={cn("mt-4 flex flex-col gap-3 rounded-2xl bg-info/8 px-5 py-4", !compact && "mmd:flex-row mmd:items-center mmd:justify-between")}>
            <p className="flex items-center gap-2 text-sm text-grey-600">
              <Info className="size-4 shrink-0 text-info" />
              ลูกค้าจะเห็นรายการย่อยทั้งหมดในหน้าชำระเงิน และจ่ายครั้งเดียว
            </p>
            <div className="text-right">
              <p className="text-sm text-grey-500">ยอดที่ลูกค้าต้องชำระ</p>
              <p className="text-2xl font-bold tabular-nums text-primary">
                {formatMoney(t.amount)}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* ── 4. ช่องทางการชำระเงิน (Channel) ────────────────────────────────── */}
      <Panel title="ช่องทางการชำระเงิน">
        <div className="px-6 py-5">
          <div className="max-w-xs rounded-xl border-2 border-primary bg-primary/4 p-4">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={channel?.img ?? "/payment/credit-card-v2.png"}
                alt={channel?.label ?? sessionChannel ?? "—"}
                className="h-20 w-20 shrink-0 object-contain"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-bold text-foreground">
                  {channel?.label ?? sessionChannel ?? "—"}
                </span>
                {channel?.caption ? (
                  <span className="text-xs leading-relaxed text-grey-500">{channel.caption}</span>
                ) : null}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* ── 5. ตั้งค่าลิงก์ และการแจ้งเตือน ────────────────────────────────── */}
      <Panel title="ตั้งค่าลิงก์ และการแจ้งเตือน">
        <div className="px-6 py-5">
          <div className="flex flex-col gap-6">
            <div>
              <span className="mb-2 block text-sm font-semibold text-grey-700">
                ระยะเวลาก่อนลิงก์หมดอายุ
              </span>
              <span className="inline-flex h-9 items-center rounded-full border border-primary bg-primary/8 px-4 text-sm font-semibold text-primary">
                72 ชม.
              </span>
            </div>

            <div>
              <span className="mb-2 block text-sm font-semibold text-grey-700">
                การแจ้งเตือนลูกค้า
              </span>
              <span className="inline-flex h-9 items-center rounded-full border border-primary bg-primary/8 px-4 text-sm font-semibold text-primary">
                ส่งหาลูกค้า
              </span>

              <div className="mt-4">
                <div className="rounded-xl border border-[var(--divider)]">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-600">
                      <MessageSquare className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-grey-700">ส่ง SMS แจ้งลิงก์</span>
                    </span>
                  </div>
                  <div className="border-t border-[var(--divider)] px-4 py-3">
                    <p className="text-sm font-bold text-foreground">{customerPhone(t)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold text-grey-700">
                การแจ้งเตือนกำหนดผู้รับเอง
              </span>
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-[var(--divider)]">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-600">
                      <MessageSquare className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-grey-700">ส่ง SMS ถึงผู้รับที่กำหนด</span>
                    </span>
                  </div>
                  <div className="border-t border-[var(--divider)] px-4 py-3">
                    <p className="text-sm font-bold text-foreground">{customerPhone(t)}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--divider)]">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-600">
                      <Mail className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-grey-700">ส่งอีเมลถึงผู้รับที่กำหนด</span>
                    </span>
                  </div>
                  <div className="border-t border-[var(--divider)] px-4 py-3">
                    <p className="text-sm font-bold text-foreground">{t.session?.recipientEmail ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* ── 6. หมายเหตุ ─────────────────────────────────────────────────────── */}
      <Panel title="หมายเหตุ">
        <div className="px-6 py-5" />
      </Panel>

    </div>
  );
}

