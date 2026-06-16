"use client";

import { useState } from "react";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EntityDrawer } from "@/components/payment/entity-drawer";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/payment/status-badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  RefreshCw,
  XCircle,
  Copy,
  RotateCcw,
} from "lucide-react";
import type { WebhookEvent, WebhookDeliveryStatus } from "@/types/webhook";

interface PayloadDrawerProps {
  event: WebhookEvent | null;
  onClose: () => void;
  onResend?: (event: WebhookEvent) => void;
}

interface WebhookPayload {
  id: string;
  type: string;
  created: string;
  livemode: boolean;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      psp: string;
      customer: {
        name: string;
        phone: string;
      };
    };
  };
}

function buildPayload(event: WebhookEvent): WebhookPayload {
  return {
    id: event.id,
    type: event.type,
    created: `2026-05-24T${event.ts}`,
    livemode: true,
    data: {
      object: {
        id: event.txn,
        amount: 18420.0,
        currency: "THB",
        status: event.type.split(".")[1] ?? "unknown",
        psp: event.psp,
        customer: {
          name: "เมธาวิน อักษรเลิศ",
          phone: "0812345678",
        },
      },
    },
  };
}

const DELIVERY_HTTP_STATUS: Record<WebhookDeliveryStatus, string> = {
  delivered: "HTTP 200",
  retrying: "HTTP 502",
  failed: "HTTP 502",
};

function DeliveryStatusIcon({ status }: { status: WebhookDeliveryStatus }) {
  if (status === "delivered") {
    return (
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-success/12">
        <CheckCircle className="size-5 text-success-dark" />
      </div>
    );
  }
  if (status === "retrying") {
    return (
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-warning/12">
        <RefreshCw className="size-5 text-warning-dark" />
      </div>
    );
  }
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-error/12">
      <XCircle className="size-5 text-error-dark" />
    </div>
  );
}

export function PayloadDrawer({ event, onClose, onResend }: PayloadDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const payload = buildPayload(event);
  const payloadJson = JSON.stringify(payload, null, 2);

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "centropay-signature": "t=1716539478,v1=8b5ad...c92f3",
    "centropay-event-id": event.id,
    "user-agent": "CentroPay-Webhook/1.0",
  };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payloadJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silently ignore
    }
  }

  const drawerHeader = (
    <div className="flex-1 min-w-0 pr-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Webhook Payload
      </p>
      <SheetTitle className="font-mono text-sm font-bold truncate mt-0.5">
        {event.id}
      </SheetTitle>
      <SheetDescription className="sr-only">
        ข้อมูล webhook event {event.id}
      </SheetDescription>
    </div>
  );

  const drawerFooter = (
    <div className="flex w-full justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={() => { onResend?.(event); onClose(); }}
      >
        <RotateCcw />
        ส่งซ้ำ (Resend)
      </Button>
    </div>
  );

  return (
    <EntityDrawer
      open={!!event}
      onOpenChange={(open) => { if (!open) onClose(); }}
      header={drawerHeader}
      footer={drawerFooter}
      width="w-full sm:max-w-[620px]"
    >
      <div className="space-y-5">
        {/* Event summary */}
        <div className="flex items-start gap-3">
          <DeliveryStatusIcon status={event.status} />
          <div className="flex-1 min-w-0">
            <code className="inline-flex items-center rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-foreground">
              {event.type}
            </code>
            <p className="mt-1 text-sm text-muted-foreground">
              {event.txn} · {event.psp} · ความพยายาม {event.attempts} ครั้ง
              · {event.latency}
            </p>
            <div className="mt-1.5">
              <StatusBadge
                status={
                  event.status === "delivered"
                    ? "succeeded"
                    : event.status === "retrying"
                      ? "queued"
                      : "failed"
                }
                label={
                  event.status === "delivered"
                    ? "ส่งสำเร็จ"
                    : event.status === "retrying"
                      ? "กำลังลองใหม่"
                      : "ล้มเหลว"
                }
              />
            </div>
          </div>
        </div>

        {/* Request Headers */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Request Headers
          </p>
          <div className="overflow-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground">{key}:</span>
                <span className="break-all text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payload JSON */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Payload (JSON)
            </p>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleCopy}
              title="คัดลอก JSON payload"
            >
              {copied ? (
                <CheckCircle className="size-4 text-success-dark" />
              ) : (
                <Copy />
              )}
            </Button>
          </div>
          <pre className="max-h-[340px] overflow-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs text-foreground leading-relaxed whitespace-pre">
            {payloadJson}
          </pre>
        </div>

        {/* Delivery Attempts */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Delivery Attempts
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            {Array.from({ length: event.attempts }).map((_, i) => {
              const isLast = i === event.attempts - 1;
              const httpStatus =
                isLast && event.status === "delivered"
                  ? "HTTP 200"
                  : DELIVERY_HTTP_STATUS[event.status];
              const timeStr =
                isLast
                  ? event.ts
                  : (() => {
                      const base = event.ts.slice(3, 5);
                      const mins = Number(base) - i * 2;
                      return (
                        event.ts.slice(0, 3) +
                        String(Math.max(0, mins)).padStart(2, "0") +
                        event.ts.slice(5)
                      );
                    })();
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 text-sm",
                    i < event.attempts - 1 && "border-b border-border/60"
                  )}
                >
                  <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                    #{i + 1}
                  </span>
                  <span className="flex-1 font-mono text-xs text-muted-foreground">
                    {timeStr}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                      httpStatus === "HTTP 200"
                        ? "bg-success/12 text-success-dark"
                        : "bg-error/12 text-error-dark"
                    )}
                  >
                    {httpStatus}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {event.latency}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </EntityDrawer>
  );
}
