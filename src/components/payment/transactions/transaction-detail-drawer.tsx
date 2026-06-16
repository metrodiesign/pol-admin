"use client";

import { useState } from "react";
import { EntityDrawer } from "@/components/payment/entity-drawer";
import { StatusBadge } from "@/components/payment/status-badge";
import { ChannelTag } from "@/components/payment/channel-tag";
import { LifecycleTrack } from "@/components/payment/lifecycle-track";
import { Button } from "@/components/ui/button";
import { TransactionActionDialog } from "./transaction-action-dialog";
import { statusToLifecycleSteps } from "./lifecycle-utils";
import { useToast } from "@/components/payment/toast/toast-provider";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  RotateCcw,
  FileText,
  Send,
  CheckCircle,
  Database,
  ShieldCheck,
  Phone,
  Link,
  History,
  GitBranch,
  Package,
  ExternalLink,
  Copy,
} from "lucide-react";
import type { Transaction } from "@/types/transaction";
import type { TxnActionKind } from "./transaction-action-dialog";

function formatTHB(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

type TimelineTone = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

interface TimelineEvent {
  ts: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  tone: TimelineTone;
}

const TONE_CLASSES: Record<TimelineTone, string> = {
  primary: "border-primary text-primary",
  success: "border-success text-success",
  warning: "border-warning text-warning",
  danger:  "border-error text-error",
  info:    "border-primary text-primary",
  neutral: "border-grey-400 text-grey-500",
};

function buildTimeline(txn: Transaction): TimelineEvent[] {
  return [
    {
      ts: "14:32:18",
      label: "ส่ง Webhook สำเร็จ",
      desc: "payment.succeeded → policy-core",
      icon: <CheckCircle className="size-3" strokeWidth={2.5} />,
      tone: "success",
    },
    {
      ts: "14:32:12",
      label: "Settled",
      desc: "รับเงินเข้าบัญชีตัวกลาง (รอรอบ T+2)",
      icon: <Database className="size-3" strokeWidth={2.5} />,
      tone: "info",
    },
    {
      ts: "14:32:08",
      label: "Capture สำเร็จ",
      desc: `เก็บยอด ฿${formatTHB(txn.amount)} จาก ${txn.psp}`,
      icon: <Check className="size-3" strokeWidth={2.5} />,
      tone: "success",
    },
    {
      ts: "14:32:04",
      label: "Authorize สำเร็จ",
      desc: "อนุมัติวงเงินจากธนาคารผู้ออกบัตร",
      icon: <ShieldCheck className="size-3" strokeWidth={2.5} />,
      tone: "success",
    },
    {
      ts: "14:31:58",
      label: "ลูกค้าเริ่มชำระเงิน",
      desc: `Redirect ไป Hosted Payment Page (${txn.psp})`,
      icon: <ExternalLink className="size-3" strokeWidth={2.5} />,
      tone: "info",
    },
    {
      ts: "14:31:22",
      label: "ลูกค้าเปิดลิงก์",
      desc: `จาก SMS ที่ส่งไปยัง ${txn.customer.phone}`,
      icon: <Phone className="size-3" strokeWidth={2.5} />,
      tone: "info",
    },
    {
      ts: "14:30:14",
      label: "สร้างลิงก์ชำระเงิน",
      desc: `โดย ${txn.originator.name} (${txn.originator.code})`,
      icon: <Link className="size-3" strokeWidth={2.5} />,
      tone: "primary",
    },
  ];
}

interface TransactionDetailDrawerProps {
  txn: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionSuccess?: (kind: TxnActionKind, reason: string, notify: boolean) => void;
}

export function TransactionDetailDrawer({
  txn,
  open,
  onOpenChange,
  onActionSuccess,
}: TransactionDetailDrawerProps) {
  const toast = useToast();
  const [actionKind, setActionKind] = useState<TxnActionKind | null>(null);

  async function copyTxnId() {
    if (!txn) return;
    try {
      await navigator.clipboard.writeText(txn.id);
      toast.success("คัดลอกแล้ว", { description: txn.id });
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  }

  if (!txn) return null;

  const canCapture =
    txn.status === "authorized" || txn.status === "processing";
  const canVoid =
    txn.status === "authorized" ||
    txn.status === "pending" ||
    txn.status === "processing";
  const canRefund = txn.status === "succeeded";

  const lifecycleSteps = statusToLifecycleSteps(txn.status);
  const timeline = buildTimeline(txn);

  return (
    <>
      <EntityDrawer
        open={open}
        onOpenChange={onOpenChange}
        title="รายละเอียดธุรกรรม"
        description={txn.id}
        width="sm:max-w-xl"
      >
        {/* Amount + status */}
        <div className="mb-5">
          <p className="text-sm text-grey-500">มูลค่ารวม</p>
          <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums">
            ฿{formatTHB(txn.amount)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={txn.status} />
            <ChannelTag channel={txn.channel} />
            <span className="inline-flex items-center rounded-md bg-grey-100 px-2 py-0.5 text-xs font-semibold text-grey-700 dark:bg-grey-800 dark:text-grey-300">
              {txn.psp}
            </span>
            <button
              type="button"
              onClick={copyTxnId}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono text-grey-500 hover:bg-grey-100 hover:text-foreground transition-colors dark:hover:bg-grey-800"
              title="คัดลอกรหัสธุรกรรม"
            >
              <Copy className="size-3" />
              {txn.id}
            </button>
          </div>
        </div>

        {/* Lifecycle */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-500">
            สถานะ Lifecycle
          </p>
          <LifecycleTrack steps={lifecycleSteps} />
        </div>

        {/* Action buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            className={cn(
              "gap-1.5",
              canCapture
                ? "bg-success text-white hover:bg-success/90 border-0"
                : "border-grey-200 text-grey-400 cursor-not-allowed"
            )}
            variant={canCapture ? "default" : "outline"}
            disabled={!canCapture}
            onClick={() => canCapture && setActionKind("capture")}
          >
            <Check className="size-3.5" strokeWidth={2.5} />
            Capture
          </Button>
          <Button
            size="sm"
            variant={canVoid ? "destructive" : "outline"}
            disabled={!canVoid}
            className={cn("gap-1.5", !canVoid && "border-grey-200 text-grey-400 cursor-not-allowed")}
            onClick={() => canVoid && setActionKind("void")}
          >
            <X className="size-3.5" strokeWidth={2.5} />
            Void
          </Button>
          <Button
            size="sm"
            variant={canRefund ? "default" : "outline"}
            disabled={!canRefund}
            className={cn("gap-1.5", !canRefund && "border-grey-200 text-grey-400 cursor-not-allowed")}
            onClick={() => canRefund && setActionKind("refund")}
          >
            <RotateCcw className="size-3.5" />
            Refund
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast.success("ดาวน์โหลดใบเสร็จแล้ว", {
                description: `ใบเสร็จสำหรับ ${txn.id}`,
              })
            }
          >
            <FileText className="size-3.5" />
            ใบเสร็จ
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast.success("ส่ง Webhook ซ้ำแล้ว", {
                description: `ส่ง event ซ้ำสำหรับ ${txn.id}`,
              })
            }
          >
            <Send className="size-3.5" />
            ส่งซ้ำ
          </Button>
        </div>

        {/* Customer + Originator */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-grey-200 bg-grey-50 p-3.5 dark:border-grey-800 dark:bg-grey-900/50">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-grey-500">
              ลูกค้า
            </p>
            <p className="text-sm font-semibold">{txn.customer.name}</p>
            <p className="mt-0.5 text-sm text-grey-500">{txn.customer.email}</p>
            <p className="text-sm text-grey-500">{txn.customer.phone}</p>
          </div>
          <div className="rounded-xl border border-grey-200 bg-grey-50 p-3.5 dark:border-grey-800 dark:bg-grey-900/50">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-grey-500">
              ที่มาของรายการ
            </p>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                {txn.originator.code}
              </span>
              <span className="text-sm font-semibold">{txn.originator.name}</span>
            </div>
            <p className="text-sm text-grey-500">
              {txn.originator.type === "branch"
                ? "สาขา"
                : txn.originator.type === "agent"
                ? "ตัวแทน"
                : txn.originator.type === "broker"
                ? "นายหน้า"
                : txn.originator.type === "staff"
                ? "พนักงานประจำสาขา"
                : "แอปเชื่อมต่อ"}{" "}
              · {txn.originator.region}
            </p>
            <p className="mt-1 text-xs text-grey-500 flex items-center gap-1">
              <GitBranch className="size-3" />
              อ้างอิงลิงก์{" "}
              <span className="font-mono">{txn.ref}</span>
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-500">
            รายการในธุรกรรม ({txn.itemCount} รายการ)
          </p>
          <div className="overflow-hidden rounded-xl border border-grey-200 dark:border-grey-800">
            {txn.items.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3",
                  i < txn.items.length - 1 &&
                    "border-b border-grey-100 dark:border-grey-800"
                )}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-primary/10 text-primary">
                  <Package className="size-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.type}</p>
                  <p className="mt-0.5 text-xs text-grey-500">
                    กรมธรรม์{" "}
                    <span className="font-mono">{item.policyNo}</span> ·{" "}
                    {item.period}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold tabular-nums">
                  ฿{formatTHB(item.amount)}
                </p>
              </div>
            ))}
            <div className="flex items-center gap-3 border-t border-grey-100 bg-grey-50 px-3.5 py-3 dark:border-grey-800 dark:bg-grey-900/50">
              <p className="flex-1 text-sm font-semibold">รวมทั้งสิ้น</p>
              <p className="text-base font-bold tabular-nums">
                ฿{formatTHB(txn.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="mb-2.5 flex items-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-grey-500">
              ไทม์ไลน์
            </p>
            <Button variant="ghost" size="sm" className="ml-auto gap-1 text-xs">
              <History className="size-3.5" />
              ดูทั้งหมด
            </Button>
          </div>
          <div className="relative flex flex-col gap-3.5">
            {/* Vertical line */}
            <div className="absolute bottom-3.5 left-3 top-3.5 w-px bg-grey-200 dark:bg-grey-800" />
            {timeline.map((ev, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div
                  className={cn(
                    "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 bg-bg-paper",
                    TONE_CLASSES[ev.tone]
                  )}
                >
                  {ev.icon}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-semibold">{ev.label}</p>
                    <p className="ml-auto text-xs text-grey-500 tabular-nums">
                      {ev.ts}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-grey-500">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </EntityDrawer>

      <TransactionActionDialog
        kind={actionKind}
        txn={txn}
        onClose={() => setActionKind(null)}
        onSuccess={onActionSuccess}
      />
    </>
  );
}
