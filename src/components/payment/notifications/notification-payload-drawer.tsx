"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/payment/status-badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Mail,
  RefreshCw,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/payment/toast/toast-provider";
import type { Notification } from "@/lib/mock/notifications";

interface NotificationPayloadDrawerProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResend: (n: Notification) => void;
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-grey-100 px-3.5 py-2.5 last:border-b-0 dark:border-grey-800">
      <div className="w-[120px] shrink-0 pt-px text-sm text-grey-500">
        {label}
      </div>
      <div
        className={cn(
          "flex-1 text-sm font-medium text-foreground break-all",
          mono && "font-mono",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function formatSentAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function NotificationPayloadDrawer({
  notification,
  open,
  onOpenChange,
  onResend,
}: NotificationPayloadDrawerProps) {
  const toast = useToast();

  if (!notification) return null;

  const isSms = notification.type === "sms";
  const statusVariant =
    notification.status === "sent"
      ? "sent"
      : notification.status === "queued"
        ? "queued"
        : "failed";

  const DeliveryIcon =
    notification.status === "sent"
      ? CheckCircle2
      : notification.status === "queued"
        ? Clock
        : XCircle;

  const deliveryIconClass =
    notification.status === "sent"
      ? "bg-success/10 text-success-dark"
      : notification.status === "queued"
        ? "bg-warning/10 text-warning-dark"
        : "bg-error/10 text-error-dark";

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("คัดลอกแล้ว");
    } catch {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-[rgba(145,158,171,0.12)] px-5 py-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md",
                isSms ? "bg-success/10 text-success-dark" : "bg-primary/10 text-primary",
              )}
            >
              {isSms ? (
                <MessageSquare className="size-3.5" strokeWidth={1.75} />
              ) : (
                <Mail className="size-3.5" strokeWidth={1.75} />
              )}
            </div>
            <SheetTitle className="text-sm font-semibold">
              {isSms ? "SMS" : "Email"} #{notification.id}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-grey-500 font-mono">
            {notification.templateId} · {notification.templateName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Status summary */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                deliveryIconClass,
              )}
            >
              <DeliveryIcon className="size-5" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={statusVariant} />
                <span className="text-sm text-grey-500">
                  {notification.delivery.attempts > 0
                    ? `${notification.delivery.attempts} ครั้ง · ${notification.delivery.latency}`
                    : "ยังไม่ได้ส่ง"}
                </span>
              </div>
              <p className="mt-1 text-sm text-grey-500">
                {notification.recipient} · {formatSentAt(notification.sentAt)}
              </p>
            </div>
          </div>

          {/* Delivery detail */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-500">
              รายละเอียดการส่ง
            </p>
            <div className="overflow-hidden rounded-lg border border-grey-200 dark:border-grey-800">
              <InfoRow label="ผู้รับ" value={notification.recipient} mono />
              <InfoRow label="ช่องทาง" value={notification.type.toUpperCase()} />
              <InfoRow label="Provider" value={notification.delivery.provider} />
              <InfoRow
                label="ความพยายาม"
                value={`${notification.delivery.attempts} ครั้ง`}
              />
              <InfoRow label="Latency" value={notification.delivery.latency} mono />
              <InfoRow label="Originator" value={notification.orig} mono />
              <InfoRow label="เวลาส่ง" value={formatSentAt(notification.sentAt)} />
              {notification.delivery.errorCode && (
                <InfoRow
                  label="Error Code"
                  value={notification.delivery.errorCode}
                  mono
                />
              )}
              {notification.delivery.errorMessage && (
                <InfoRow
                  label="เหตุผล"
                  value={notification.delivery.errorMessage}
                />
              )}
            </div>
          </div>

          {/* Message content */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-grey-500">
                เนื้อหาข้อความ
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-xs text-grey-500 hover:text-foreground"
                onClick={() => copyToClipboard(notification.body)}
                aria-label="คัดลอกเนื้อหา"
              >
                <Copy className="size-3" />
                คัดลอก
              </Button>
            </div>
            <pre className="overflow-auto whitespace-pre-wrap rounded-lg border border-grey-200 bg-grey-50 p-3.5 font-mono text-sm text-foreground leading-relaxed dark:border-grey-800 dark:bg-grey-900">
              {notification.body}
            </pre>
          </div>

          {/* Payload JSON */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-grey-500">
                Payload (JSON)
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-xs text-grey-500 hover:text-foreground"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(buildPayload(notification), null, 2),
                  )
                }
                aria-label="คัดลอก JSON"
              >
                <Copy className="size-3" />
                คัดลอก
              </Button>
            </div>
            <pre className="max-h-[280px] overflow-auto rounded-lg border border-grey-200 bg-grey-50 p-3.5 font-mono text-xs text-foreground leading-relaxed dark:border-grey-800 dark:bg-grey-900">
              {JSON.stringify(buildPayload(notification), null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[rgba(145,158,171,0.12)] px-5 py-3.5">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              onResend(notification);
              onOpenChange(false);
            }}
          >
            <RefreshCw className="size-3.5" />
            ส่งซ้ำ
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            ปิด
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function buildPayload(n: Notification): Record<string, unknown> {
  return {
    id: `notif_${n.id}`,
    type: `notification.${n.type}.${n.status}`,
    created: n.sentAt,
    livemode: true,
    data: {
      object: {
        id: n.id,
        channel: n.type,
        recipient: n.recipient,
        subject: n.subject,
        template_id: n.templateId,
        template_name: n.templateName,
        originator: n.orig,
        status: n.status,
        delivery: {
          provider: n.delivery.provider,
          attempts: n.delivery.attempts,
          latency: n.delivery.latency,
          ...(n.delivery.errorCode
            ? {
                error_code: n.delivery.errorCode,
                error_message: n.delivery.errorMessage,
              }
            : {}),
        },
      },
    },
  };
}
