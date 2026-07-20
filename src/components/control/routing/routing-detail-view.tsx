"use client";

import { ArrowRight, ListOrdered, Route, ShieldAlert } from "lucide-react";
import type { RoutingRule } from "@/types/routing-rule";
import { CHANNEL_LABEL, PSP_LABEL, enabledTone } from "@/lib/control/routing";
import { useControlStore } from "@/lib/control/store";
import { routingStore, toggleRule } from "@/lib/control/routing-store";
import { showControlToast } from "@/components/control/shared/control-toast";
import { MERCHANT_LABEL } from "@/lib/mock/merchants";
import { formatTHB } from "@/lib/utils";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";
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
      <p className="text-h6 text-foreground">ไม่พบ Routing Rule นี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัส rule อาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

export function RoutingDetailView({ id }: { id?: string }) {
  const rules = useControlStore(routingStore);
  const rule = rules.find((r) => r.id === id);
  if (!rule) return <NotFound />;

  const tone = enabledTone(rule.enabled);

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
                Control plane · กฎการกำหนดเส้นทาง
              </span>
              <h1 className="text-h5 text-foreground">
                ลำดับ{" "}
                <span className="text-data">#{rule.priority}</span> ·{" "}
                {CHANNEL_LABEL[rule.channel]}
              </h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {rule.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge
              tone={tone}
              label={rule.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField label="บริษัท" value={MERCHANT_LABEL[rule.merchantId]} />
            <ReadField label="ลำดับความสำคัญ" value={`#${rule.priority}`} mono />
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning-dark" />
            <p className="text-xs font-medium text-warning-dark">
              การเปลี่ยนแปลงต้องผ่าน Approvals (maker-checker)
            </p>
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="เงื่อนไขการจับคู่"
          icon={<ListOrdered className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField label="บริษัท" value={MERCHANT_LABEL[rule.merchantId]} />
            <ReadField label="ช่องทาง" value={CHANNEL_LABEL[rule.channel]} />
            <ReadField
              label="ช่วงจำนวนเงิน"
              value={amountRange(rule)}
              mono
              className="sm:col-span-2"
            />
          </div>
        </DetailCard>

        <DetailCard
          title="การส่งต่อไปยัง PSP"
          icon={<Route className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField
              label="PSP ปลายทาง"
              value={PSP_LABEL[rule.targetPsp]}
            />
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
        </DetailCard>

        <DetailCard
          title="สถานะการใช้งาน"
          icon={<ShieldAlert className="size-5 text-grey-600" />}
        >
          <div className="flex items-center gap-3">
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
        </DetailCard>
      </div>
    </div>
  );
}
