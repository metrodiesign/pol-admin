"use client";

import { useState } from "react";
import { FileJson, Loader2, RotateCw, ShieldAlert, ShieldCheck, Truck } from "lucide-react";
import { useControlStore } from "@/lib/control/store";
import { webhookStore, replayEvent } from "@/lib/control/webhook-store";
import { showControlToast } from "@/components/control/shared/control-toast";
import { PSP_LABEL, DELIVERY_LABEL, deliveryTone } from "@/lib/control/webhook";
import { TENANT_LABEL } from "@/lib/mock/tenants";
import { formatDateTime } from "@/lib/control/format";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { Button } from "@/components/ui/button";

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="mb-5 flex items-center gap-2 text-h6 text-foreground">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function NotFound() {
  return (
    <div
      className="rounded-2xl bg-card p-10 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-h6 text-foreground">ไม่พบ webhook event นี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัส event อาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

export function WebhookDetailView({ id }: { id?: string }) {
  const events = useControlStore(webhookStore);
  const event = events.find((e) => e.id === id);
  const [replaying, setReplaying] = useState(false);

  if (!event) return <NotFound />;

  const tone = deliveryTone(event.deliveryStatus);
  const isDelivered = event.deliveryStatus === "delivered";

  const onReplay = () => {
    setReplaying(true);
    setTimeout(() => {
      replayEvent(event.id);
      showControlToast("ส่ง event ซ้ำสำเร็จ", "ok");
      setReplaying(false);
    }, 700);
  };

  return (
    <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
      {/* Summary */}
      <div className="mmd:col-span-4">
        <div
          className="flex flex-col gap-5 rounded-2xl bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-stretch gap-3">
            <StatusSpine tone={tone} className="h-auto" />
            <div className="min-w-0">
              <span className="text-overline text-grey-500">
                Control plane · เหตุการณ์ Webhook
              </span>
              <h1 className="text-h5 text-foreground">{event.eventType}</h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {event.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge
              tone={tone}
              label={DELIVERY_LABEL[event.deliveryStatus]}
            />
            {event.signatureVerified ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-success/12 px-1.5 py-1 text-xs font-semibold text-success-dark">
                <ShieldCheck className="size-3.5 text-success" />
                Signature ยืนยันแล้ว
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-warning/12 px-1.5 py-1 text-xs font-semibold text-warning-dark">
                <ShieldAlert className="size-3.5 text-warning" />
                Signature ไม่ผ่าน
              </span>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            disabled={isDelivered || replaying}
            onClick={onReplay}
          >
            {replaying ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <RotateCw className="size-4" />
                ส่ง event ซ้ำ
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField label="PSP" value={PSP_LABEL[event.psp]} />
            <ReadField label="บริษัท" value={TENANT_LABEL[event.tenantId]} />
            <ReadField label="ครั้งที่ส่ง" value={String(event.attempts)} mono />
            <ReadField
              label="รับเมื่อ"
              value={formatDateTime(event.receivedAt)}
              mono
            />
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="ข้อมูลการส่ง"
          icon={<Truck className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField label="PSP" value={PSP_LABEL[event.psp]} />
            <ReadField label="บริษัท" value={TENANT_LABEL[event.tenantId]} />
            <ReadField label="ประเภท event" value={event.eventType} />
            <ReadField
              label="สถานะการส่ง"
              value={DELIVERY_LABEL[event.deliveryStatus]}
            />
            <ReadField label="ครั้งที่ส่ง" value={String(event.attempts)} mono />
            <ReadField
              label="รับเมื่อ"
              value={formatDateTime(event.receivedAt)}
              mono
            />
            <ReadField
              label="ลายเซ็น"
              value={event.signatureVerified ? "ยืนยันแล้ว" : "ไม่ผ่าน"}
            />
          </div>
        </DetailCard>

        <DetailCard
          title="Payload ดิบ"
          icon={<FileJson className="size-5 text-grey-600" />}
        >
          <p className="mb-4 text-sm text-grey-600">
            payload ดิบที่ได้รับจาก PSP — ใช้สำหรับตรวจสอบและกระทบยอด
            ไม่ใช่ค่าที่แก้ไขได้
          </p>
          <pre className="text-data max-h-[28rem] overflow-auto rounded-xl border border-[var(--divider)] bg-grey-100 p-4 text-xs text-grey-700 dark:bg-grey-900">
            {event.payload}
          </pre>
        </DetailCard>

        <DetailCard
          title="Idempotency และแหล่งความจริง"
          icon={<ShieldCheck className="size-5 text-grey-600" />}
        >
          <p className="text-sm text-grey-600">
            Webhook คือแหล่งความจริงของสถานะการชำระเงิน —
            สถานะทั้งหมดอ้างอิงจาก event ที่ยืนยัน signature แล้วเท่านั้น
            การส่งซ้ำเป็น idempotent โดยอ้างอิง event id เดิม
            event เดิมจะไม่ถูกประมวลผลซ้ำ
          </p>
        </DetailCard>
      </div>
    </div>
  );
}
