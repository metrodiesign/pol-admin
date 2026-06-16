"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/payment/toast/toast-provider";
import { EntityDrawer } from "@/components/payment/entity-drawer";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/payment/confirm-modal";
import { StatusBadge } from "@/components/payment/status-badge";
import { ChannelTag } from "@/components/payment/channel-tag";
import type { Invoice } from "@/types/invoice";
import {
  Copy,
  Download,
  EllipsisVertical,
  Eye,
  Link2,
  Clock,
  MessageSquare,
  Mail,
  RefreshCw,
  Send,
  Settings,
  History,
  X,
  FileText,
} from "lucide-react";
import { cn, formatTHBPlain } from "@/lib/utils";
import { BRANCHES, AGENTS, CONNECTED_APPS } from "@/lib/mock/originators";

const fmtTHB = formatTHBPlain;

function fmtDateLong(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "long",
    year: "2-digit",
  }).format(new Date(iso));
}

function fmtDateShort(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getHoursUntilExpiry(expiresAt: string): number {
  return Math.max(
    0,
    Math.round((new Date(expiresAt).getTime() - Date.now()) / 3_600_000),
  );
}

function lookupOriginator(id: string) {
  const branch = BRANCHES.find((b) => b.id === id);
  if (branch) return { code: branch.code, name: branch.name, type: "branch" as const };
  const agent = AGENTS.find((a) => a.id === id);
  if (agent) return { code: agent.code, name: agent.name, type: agent.type as "agent" | "broker" | "staff" };
  const app = CONNECTED_APPS.find((a) => a.id === id);
  if (app) return { code: app.code, name: app.name, type: "app" as const };
  return { code: id, name: id, type: "branch" as const };
}

function typeLabel(type: "branch" | "agent" | "broker" | "staff" | "app"): string {
  const map = {
    branch: "สาขา",
    agent: "ตัวแทน",
    broker: "นายหน้า",
    staff: "พนักงานประจำสาขา",
    app: "แอปเชื่อมต่อ",
  };
  return map[type];
}

interface TimelineEvent {
  ts: string;
  label: string;
  desc: string;
  tone: "primary" | "success" | "warning" | "danger" | "neutral";
}

function buildTimeline(inv: Invoice): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (inv.status === "paid") {
    events.push({
      ts: fmtDateShort(inv.expiresAt),
      label: "ลูกค้าชำระสำเร็จ",
      desc: `ผ่านช่องทาง ${inv.channel}`,
      tone: "success",
    });
  }
  if (inv.status === "expired") {
    events.push({
      ts: fmtDateShort(inv.expiresAt),
      label: "ลิงก์หมดอายุ",
      desc: "ลูกค้าไม่ได้ชำระเงินภายในเวลาที่กำหนด",
      tone: "neutral",
    });
  }
  if (inv.status === "voided") {
    events.push({
      ts: fmtDateShort(inv.expiresAt),
      label: "ยกเลิกโดยผู้ดูแล",
      desc: "ใบแจ้งหนี้ถูกยกเลิก",
      tone: "danger",
    });
  }
  if (inv.views > 0) {
    events.push({
      ts: "—",
      label: "ลูกค้าเปิดลิงก์",
      desc: `เข้าชม ${inv.views} ครั้ง`,
      tone: "primary",
    });
  }
  events.push({
    ts: fmtDateShort(inv.createdAt),
    label: "สร้างใบแจ้งหนี้",
    desc: `โดย ${inv.originatorId}`,
    tone: "primary",
  });

  return events;
}

const TONE_CLASS: Record<string, string> = {
  primary: "border-primary text-primary",
  success: "border-success text-success-dark",
  warning: "border-warning text-warning-dark",
  danger: "border-error text-error-dark",
  neutral: "border-grey-400 text-grey-500",
};

interface InvoiceDrawerProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDrawer({
  invoice,
  open,
  onOpenChange,
}: InvoiceDrawerProps) {
  const router = useRouter();
  const toast = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!invoice) return null;

  const hasActiveLink =
    invoice.url &&
    (invoice.status === "pending" ||
      invoice.status === "partial" ||
      invoice.status === "overdue");
  const canEdit =
    invoice.status === "draft" ||
    invoice.status === "pending" ||
    invoice.status === "overdue" ||
    invoice.status === "expired";

  const hoursLeft = getHoursUntilExpiry(invoice.expiresAt);
  const orig = lookupOriginator(invoice.originatorId);
  const timeline = buildTimeline(invoice);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(invoice!.url);
      toast.success("คัดลอกลิงก์แล้ว", { description: invoice!.url });
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  }

  function goEdit() {
    onOpenChange(false);
    router.push(`/invoices/new?edit=${invoice!.id}`);
  }

  function goDuplicate() {
    onOpenChange(false);
    const dupId = invoice!.id;
    const targetUrl = `/invoices/new?duplicate=${dupId}`;
    toast.success("ทำซ้ำใบแจ้งหนี้แล้ว", {
      description: `สร้างสำเนาจาก ${dupId}`,
      action: {
        label: "ไปดู",
        onClick: () => router.push(targetUrl),
      },
    });
    router.push(targetUrl);
  }

  const drawerHeader = (
    <>
      <div className="flex-1 min-w-0">
        <SheetTitle className="text-sm font-semibold text-grey-500">
          ใบแจ้งหนี้
        </SheetTitle>
        <SheetDescription className="font-mono text-sm font-bold text-foreground">
          {invoice.id}
        </SheetDescription>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="ดาวน์โหลด PDF"
      >
        <Download className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="ดูเป็นลูกค้า"
      >
        <FileText className="size-4" />
      </Button>
    </>
  );

  return (
    <>
      <EntityDrawer
        open={open}
        onOpenChange={onOpenChange}
        header={drawerHeader}
        width="w-full sm:max-w-[600px]"
      >
        <div className="py-1">
        {/* Hero */}
            <div className="mb-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5">
              <p className="text-sm text-grey-500">ยอดที่ต้องชำระ</p>
              <p className="tabular-nums text-3xl font-bold tracking-tight">
                ฿{fmtTHB(invoice.total)}
              </p>
              <p className="mt-1 text-sm text-grey-500">
                {invoice.items.length} รายการ · ครบกำหนด{" "}
                {fmtDateLong(invoice.expiresAt)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={invoice.status} />
                <ChannelTag channel={invoice.channel} />
                {hasActiveLink && (
                  <span className="inline-flex items-center gap-1 text-sm text-grey-500">
                    <Clock className="size-3" />
                    {hoursLeft < 24
                      ? `${hoursLeft} ชม.`
                      : `${Math.round(hoursLeft / 24)} วัน`}
                  </span>
                )}
                {invoice.views > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm text-grey-500">
                    <Eye className="size-3" />
                    ลูกค้าเปิด {invoice.views} ครั้ง
                  </span>
                )}
              </div>
            </div>

            {/* Payment link */}
            {hasActiveLink && (
              <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-lg border border-[rgba(145,158,171,0.12)] bg-[var(--action-hover)] px-3.5 py-2.5">
                <Link2 className="size-4 shrink-0 text-primary" />
                <code className="min-w-0 flex-1 truncate font-mono text-sm text-grey-700 dark:text-grey-300">
                  {invoice.url}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="h-7 text-xs"
                >
                  <Copy className="size-3 mr-1" />
                  คัดลอก
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    toast.success("ส่ง SMS แล้ว", {
                      description: `ส่งลิงก์ไปยัง ${invoice.customer.phone || "ลูกค้า"}`,
                    })
                  }
                >
                  <MessageSquare className="size-3 mr-1" />
                  ส่ง SMS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    toast.success("ส่งอีเมลแล้ว", {
                      description: `ส่งลิงก์ไปยัง ${invoice.customer.email || "ลูกค้า"}`,
                    })
                  }
                >
                  <Mail className="size-3 mr-1" />
                  ส่งอีเมล
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
              {invoice.status === "draft" ? (
                <Button size="sm" onClick={goEdit}>
                  <Send className="size-3.5 mr-1" />
                  ออกลิงก์ &amp; ส่งให้ลูกค้า
                </Button>
              ) : !invoice.url ? (
                <Button size="sm" onClick={goEdit}>
                  <Link2 className="size-3.5 mr-1" />
                  สร้างลิงก์ชำระเงิน
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  <Eye className="size-3.5 mr-1" />
                  ดูเป็นลูกค้า
                </Button>
              )}

              {canEdit && invoice.status !== "draft" && (
                <Button variant="outline" size="sm" onClick={goEdit}>
                  <Settings className="size-3.5 mr-1" />
                  แก้ไขใบแจ้งหนี้
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.success("ส่งลิงก์ให้ลูกค้าแล้ว", {
                    description: `ส่ง SMS และอีเมลไปยัง ${invoice.customer.name}`,
                  })
                }
              >
                <Send className="size-3.5 mr-1" />
                ส่งให้ลูกค้า
              </Button>

              <Button variant="outline" size="sm">
                <History className="size-3.5 mr-1" />
                ประวัติ
              </Button>

              <div className="flex-1" />

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="sm" aria-label="เพิ่มเติม">
                      <EllipsisVertical className="size-4" />
                    </Button>
                  }
                >
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4}>
                  {canEdit && (
                    <DropdownMenuItem onClick={goEdit}>
                      <Settings className="size-4" />
                      แก้ไขใบแจ้งหนี้
                    </DropdownMenuItem>
                  )}
                  {hasActiveLink && (
                    <DropdownMenuItem
                      onClick={() =>
                        toast.success("ขยายเวลาลิงก์แล้ว", {
                          description: "ลิงก์ชำระเงินมีอายุเพิ่มอีก 72 ชั่วโมง",
                        })
                      }
                    >
                      <RefreshCw className="size-4" />
                      ขยายเวลาหมดอายุ
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Download className="size-4" />
                    ดาวน์โหลด PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={goDuplicate}>
                    <Copy className="size-4" />
                    ทำซ้ำใบแจ้งหนี้
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setConfirmCancel(true)}
                  >
                    <X className="size-4" />
                    ยกเลิกใบแจ้งหนี้
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Customer & originator */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[rgba(145,158,171,0.12)] bg-[var(--action-hover)] p-3.5">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-grey-500">
                  ลูกค้า
                </p>
                <p className="text-sm font-semibold">{invoice.customer.name}</p>
                {invoice.customer.email && (
                  <p className="text-sm text-grey-500 mt-0.5">
                    {invoice.customer.email}
                  </p>
                )}
                {invoice.customer.phone && (
                  <p className="font-mono text-sm text-grey-500">
                    {invoice.customer.phone}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-[rgba(145,158,171,0.12)] bg-[var(--action-hover)] p-3.5">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-grey-500">
                  ที่มาของใบแจ้งหนี้
                </p>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">
                    {orig.code}
                  </span>
                  <span className="text-sm font-semibold">{orig.name}</span>
                </div>
                <p className="text-sm text-grey-500">{typeLabel(orig.type)}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-500">
                รายการเบี้ยประกัน ({invoice.items.length})
              </p>
              <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.12)]">
                {invoice.items.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3",
                      i < invoice.items.length - 1 &&
                        "border-b border-[rgba(145,158,171,0.12)]",
                    )}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.type}</p>
                      <p className="text-[12px] text-grey-500">
                        <span className="font-mono">{item.policyNo}</span> ·{" "}
                        {item.period}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums text-sm font-bold">
                        ฿{fmtTHB(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3 border-t border-[rgba(145,158,171,0.12)] bg-[var(--action-hover)] px-3.5 py-3">
                  <p className="flex-1 text-sm font-semibold">รวมทั้งสิ้น</p>
                  <p className="tabular-nums text-base font-bold">
                    ฿{fmtTHB(invoice.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-500">
                เลขที่อ้างอิง
              </p>
              <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.12)]">
                {[1, 2, 3, 4, 5].map((n, i) => (
                  <div
                    key={n}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5",
                      i < 4 && "border-b border-[rgba(145,158,171,0.12)]",
                    )}
                  >
                    <span className="w-[110px] text-sm text-grey-500">
                      Reference {n}
                    </span>
                    <span className="flex-1 font-mono text-sm">
                      {invoice.refs[i] ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-grey-500">
                ไทม์ไลน์
              </p>
              <div className="relative flex flex-col gap-3.5">
                <div className="absolute left-[13px] top-3.5 bottom-3.5 w-0.5 bg-grey-200 dark:bg-grey-700" />
                {timeline.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 bg-bg-paper",
                        TONE_CLASS[ev.tone] ?? TONE_CLASS.neutral,
                      )}
                    >
                      <span className="size-2 rounded-full bg-current" />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-semibold">{ev.label}</p>
                        <p className="ml-auto text-sm text-grey-500">{ev.ts}</p>
                      </div>
                      <p className="text-sm text-grey-500 mt-0.5">{ev.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </EntityDrawer>

      <ConfirmModal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="ยืนยันการยกเลิกใบแจ้งหนี้"
        description={`ใบ ${invoice.id} · ลูกค้า ${invoice.customer.name}`}
        confirmLabel="ยืนยันยกเลิก"
        destructive
        onConfirm={() => {
          setConfirmCancel(false);
          onOpenChange(false);
          toast.success("ยกเลิกใบแจ้งหนี้แล้ว", {
            description: `ใบ ${invoice.id} ถูกยกเลิกเรียบร้อย`,
          });
        }}
      >
        <p className="text-sm leading-relaxed text-grey-600">
          ใบแจ้งหนี้และลิงก์ชำระเงินจะถูกปิดทันที การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
      </ConfirmModal>
    </>
  );
}
