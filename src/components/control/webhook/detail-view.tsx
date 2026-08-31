"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, RotateCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useControlStore } from "@/lib/control/store";
import { webhookStore, replayEvent } from "@/lib/control/webhook-store";
import { showControlToast } from "@/components/control/shared/toast";
import { PSP_LABEL, DELIVERY_LABEL, deliveryTone } from "@/lib/control/webhook";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { formatDateTime } from "@/lib/control/format";
import {
  DetailIdentity,
  DetailNotFound,
  DetailSection,
} from "@/components/control/shared/detail-shell";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { cancelClass, cardStyle, controlBadgeClass, primaryClass } from "@/components/control/shared/styles";
import { EditPageHeader } from "@/components/shared/edit-page-header";

function Header({ id, actions }: { id?: string; actions?: React.ReactNode }) {
  return (
    <EditPageHeader
      title="รายละเอียด Webhook Event"
      backHref="/control/webhooks"
      breadcrumbs={[
        { label: "Webhooks และเหตุการณ์", href: "/control/webhooks" },
        { label: id ?? "รายละเอียด" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/control/webhooks" className={cancelClass}>
            ยกเลิก
          </Link>
          {actions}
        </div>
      }
    />
  );
}

export function WebhookDetailView({ id }: { id?: string }) {
  const events = useControlStore(webhookStore);
  const event = events.find((e) => e.id === id);
  const [replaying, setReplaying] = useState(false);

  if (!event) {
    return (
      <>
        <Header id={id} />
        <DetailNotFound
          title="ไม่พบ webhook event นี้"
          message="รหัส event อาจไม่ถูกต้องหรือถูกลบไปแล้ว"
        />
      </>
    );
  }

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
    <>
      <Header
        id={event.id}
        actions={
          <button
            type="button"
            className={primaryClass}
            disabled={isDelivered || replaying}
            onClick={onReplay}
          >
            {replaying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCw className="size-4" />
            )}
            {replaying ? "กำลังส่ง..." : "ส่ง event ซ้ำ"}
          </button>
        }
      />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        <DetailIdentity
          title={event.eventType}
          subtitle={`${PSP_LABEL[event.psp]} · ${MERCHANT_LABEL[event.merchantId]}`}
          code={event.id}
          badges={
            <>
              <ControlStatusBadge tone={tone} label={DELIVERY_LABEL[event.deliveryStatus]} />
              {event.signatureVerified ? (
                <span className={`${controlBadgeClass} bg-success/12 text-success-dark`}>
                  <ShieldCheck className="size-3.5 text-success" />
                  Signature ยืนยันแล้ว
                </span>
              ) : (
                <span className={`${controlBadgeClass} bg-warning/12 text-warning-dark`}>
                  <ShieldAlert className="size-3.5 text-warning" />
                  Signature ไม่ผ่าน
                </span>
              )}
            </>
          }
        />

        <DetailSection title="ข้อมูลการส่ง">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="PSP" value={PSP_LABEL[event.psp]} />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[event.merchantId]} />
            <ReadField label="ประเภท event" value={event.eventType} />
            <ReadField label="สถานะการส่ง" value={DELIVERY_LABEL[event.deliveryStatus]} />
            <ReadField label="ครั้งที่ส่ง" value={String(event.attempts)} mono />
            <ReadField label="รับเมื่อ" value={formatDateTime(event.receivedAt)} mono />
            <ReadField label="ลายเซ็น" value={event.signatureVerified ? "ยืนยันแล้ว" : "ไม่ผ่าน"} />
          </div>
        </DetailSection>

        <DetailSection
          title="Payload ดิบ"
          description="payload ดิบที่ได้รับจาก PSP — ใช้สำหรับตรวจสอบและกระทบยอด ไม่ใช่ค่าที่แก้ไขได้"
        >
          <pre className="text-data max-h-[28rem] overflow-auto rounded-xl border border-[var(--divider)] bg-grey-100 p-4 text-xs text-grey-700 dark:bg-grey-900">
            {event.payload}
          </pre>
        </DetailSection>

        <DetailSection title="Idempotency และแหล่งความจริง">
          <p className="text-sm text-grey-600">
            Webhook คือแหล่งความจริงของสถานะการชำระเงิน —
            สถานะทั้งหมดอ้างอิงจาก event ที่ยืนยัน signature แล้วเท่านั้น
            การส่งซ้ำเป็น idempotent โดยอ้างอิง event id เดิม
            event เดิมจะไม่ถูกประมวลผลซ้ำ
          </p>
        </DetailSection>
      </div>
    </>
  );
}
