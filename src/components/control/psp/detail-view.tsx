"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck, Webhook, Check, Loader2 } from "lucide-react";
import { PSP_CONNECTIONS } from "@/lib/mock/control/psp-connections";
import { approvalsStore } from "@/lib/control/approvals-store";
import { CURRENT_ACTOR } from "@/lib/mock/control/approvals";
import { showControlToast } from "@/components/control/shared/toast";
import {
  PROVIDER_LABEL,
  HEALTH_LABEL,
  healthTone,
  pspById,
} from "@/lib/control/psp";
import type { MerchantCode } from "@/types/merchant";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { formatDateTime } from "@/lib/control/format";

function isMerchantCode(v: string | null): v is MerchantCode {
  return v !== null && v in MERCHANT_LABEL;
}
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
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
      <p className="text-h6 text-foreground">ไม่พบการเชื่อมต่อนี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัสการเชื่อมต่ออาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

export function PspDetailView({ id }: { id?: string }) {
  const [rotating, setRotating] = useState(false);
  const [requested, setRequested] = useState(false);
  const conn = pspById(PSP_CONNECTIONS, id);
  if (!conn) return <NotFound />;

  const tone = healthTone(conn.health);

  function requestRotation() {
    if (!conn || !isMerchantCode(conn.merchantId)) return;
    const merchantId = conn.merchantId;
    setRotating(true);
    const now = new Date().toISOString().slice(0, 19);
    setTimeout(() => {
      approvalsStore.add({
        id: `APR-${now.replace(/[-:T]/g, "").slice(2)}`,
        actionType: "credential_rotation",
        maker: CURRENT_ACTOR,
        target: conn.pspConnectionId,
        merchantId,
        requestedAt: now,
        status: "pending",
      });
      setRotating(false);
      setRequested(true);
      showControlToast("ส่งคำขอหมุนเวียนคีย์ไปยัง Approvals แล้ว", "ok");
    }, 600);
  }

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
                Control plane · การเชื่อมต่อ PSP
              </span>
              <h1 className="text-h5 text-foreground">
                {PROVIDER_LABEL[conn.psp]}
              </h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {conn.pspConnectionId}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge tone={tone} label={HEALTH_LABEL[conn.health]} />
            <span className="inline-flex items-center gap-1 rounded-md bg-success/12 px-1.5 py-1 text-xs font-semibold text-success-dark">
              <ShieldCheck className="size-3.5" />
              Redirect-only · SAQ A
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField
              label="บริษัท"
              value={isMerchantCode(conn.merchantId) ? MERCHANT_LABEL[conn.merchantId] : "—"}
            />
            <ReadField
              label="Webhook ล่าสุด"
              value={formatDateTime(conn.lastWebhookAt)}
              mono
            />
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="ข้อมูลการเชื่อมต่อ"
          icon={<Webhook className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField label="ผู้ให้บริการ" value={PROVIDER_LABEL[conn.psp]} />
            <ReadField label="สถานะ" value={HEALTH_LABEL[conn.health]} />
            <ReadField
              label="ช่องทางที่เปิดใช้"
              value={conn.enabledMethods.join(", ")}
              className="sm:col-span-2"
            />
            <ReadField label="โหมดการชำระเงิน" value="Redirect-only (PCI SAQ A)" />
          </div>
        </DetailCard>

        <DetailCard
          title="ที่เก็บข้อมูลลับ"
          icon={<KeyRound className="size-5 text-grey-600" />}
        >
          <p className="mb-4 text-sm text-grey-600">
            ความลับถูกเก็บใน vault — แสดงแบบปิดบังเท่านั้น ไม่เปิดเผยค่าจริง
            การหมุนเวียนคีย์ต้องผ่านการอนุมัติแบบ maker-checker
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ReadField
              label="คีย์ลับ"
              value={conn.maskedSecrets.secret ?? "—"}
              mono
            />
            <ReadField
              label="คีย์ลับ Webhook"
              value={conn.maskedSecrets.webhookSigningSecret ?? "—"}
              mono
            />
          </div>
          <div className="mt-5 border-t border-[var(--divider)] pt-5">
            <Button
              variant="outline"
              size="lg"
              onClick={requestRotation}
              disabled={rotating || requested}
            >
              {rotating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : requested ? (
                <Check className="size-4 text-success" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {requested ? "ส่งคำขอแล้ว — รออนุมัติ" : "ขอหมุนเวียนคีย์ผ่าน Approvals"}
            </Button>
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
