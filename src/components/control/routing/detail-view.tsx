"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import type { RoutingRule } from "@/types/control/routing-rule";
import { CHANNEL_LABEL, PSP_LABEL, enabledTone } from "@/lib/control/routing";
import { useControlStore } from "@/lib/control/store";
import { routingStore, toggleRule } from "@/lib/control/routing-store";
import { showControlToast } from "@/components/control/shared/toast";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { formatTHB } from "@/lib/utils";
import {
  DetailIdentity,
  DetailNotFound,
  DetailSection,
} from "@/components/control/shared/detail-shell";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { cancelClass, cardStyle } from "@/components/control/shared/styles";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { Switch } from "@/components/ui/switch";

/** Human-readable amount band: "฿5,000–฿49,999", "ตั้งแต่ ฿50,000", or "ทุกจำนวน". */
function amountRange(rule: RoutingRule): string {
  const { minAmount, maxAmount } = rule;
  if (minAmount == null && maxAmount == null) return "ทุกจำนวน";
  if (minAmount != null && maxAmount != null)
    return `${formatTHB(minAmount)}–${formatTHB(maxAmount)}`;
  if (minAmount != null) return `ตั้งแต่ ${formatTHB(minAmount)}`;
  return `ไม่เกิน ${formatTHB(maxAmount!)}`;
}

function Header({ id }: { id?: string }) {
  return (
    <EditPageHeader
      title="รายละเอียด Routing Rule"
      backHref="/control/routing"
      breadcrumbs={[
        { label: "กฎการกำหนดเส้นทาง", href: "/control/routing" },
        { label: id ?? "รายละเอียด" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/control/routing" className={cancelClass}>
            ยกเลิก
          </Link>
        </div>
      }
    />
  );
}

export function RoutingDetailView({ id }: { id?: string }) {
  const rules = useControlStore(routingStore);
  const rule = rules.find((r) => r.id === id);
  if (!rule) {
    return (
      <>
        <Header id={id} />
        <DetailNotFound
          title="ไม่พบ Routing Rule นี้"
          message="รหัส rule อาจไม่ถูกต้องหรือถูกลบไปแล้ว"
        />
      </>
    );
  }

  const tone = enabledTone(rule.enabled);

  return (
    <>
      <Header id={rule.id} />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        <DetailIdentity
          title={
            <>
              ลำดับ <span className="text-data">#{rule.priority}</span> · {CHANNEL_LABEL[rule.channel]}
            </>
          }
          subtitle={MERCHANT_LABEL[rule.merchantId]}
          code={rule.id}
          badges={
            <ControlStatusBadge
              tone={tone}
              label={rule.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            />
          }
        />

        <DetailSection title="เงื่อนไขการจับคู่">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="บริษัท" value={MERCHANT_LABEL[rule.merchantId]} />
            <ReadField label="ช่องทาง" value={CHANNEL_LABEL[rule.channel]} />
            <ReadField label="ลำดับความสำคัญ" value={`#${rule.priority}`} mono />
            <ReadField label="ช่วงจำนวนเงิน" value={amountRange(rule)} mono />
          </div>
        </DetailSection>

        <DetailSection title="การส่งต่อไปยัง PSP">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="PSP ปลายทาง" value={PSP_LABEL[rule.targetPsp]} />
            <ReadField
              label="PSP สำรอง"
              value={
                rule.fallbackPsp ? (
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowRight className="size-4 text-grey-500" />
                    {PSP_LABEL[rule.fallbackPsp]}
                  </span>
                ) : (
                  "—"
                )
              }
            />
          </div>
        </DetailSection>

        <DetailSection title="สถานะการใช้งาน">
          <div className="flex flex-wrap items-center gap-3">
            <Switch
              size="sm"
              checked={rule.enabled}
              onCheckedChange={() => {
                toggleRule(rule.id);
                showControlToast(
                  rule.enabled ? "ปิดใช้งานกฎแล้ว" : "เปิดใช้งานกฎแล้ว",
                  "ok",
                );
              }}
            />
            <ControlStatusBadge
              tone={tone}
              label={rule.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            />
            <p className="text-sm text-grey-600">
              {rule.enabled
                ? "rule นี้ถูกนำมาประเมินผลในการเลือก PSP"
                : "rule นี้ถูกข้ามในการประเมินผล"}
            </p>
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning-dark" />
            <p className="text-xs font-medium text-warning-dark">
              การเปลี่ยนแปลงต้องผ่าน Approvals (maker-checker)
            </p>
          </div>
        </DetailSection>
      </div>
    </>
  );
}
