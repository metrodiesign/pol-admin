"use client";

import { Lock, FileClock, GitCompareArrows } from "lucide-react";
import { AUDIT_LOG } from "@/lib/mock/audit-log";
import { RESULT_LABEL, resultTone, actionLabel } from "@/lib/control/audit";
import { TENANT_LABEL } from "@/lib/mock/tenants";
import { formatDateTime } from "@/lib/control/format";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";

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
      <p className="text-h6 text-foreground">ไม่พบบันทึกการตรวจสอบนี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัสบันทึกอาจไม่ถูกต้อง — บันทึกการตรวจสอบเป็นแบบเพิ่มต่อท้ายเท่านั้น ลบไม่ได้
      </p>
    </div>
  );
}

export function AuditDetailView({ id }: { id?: string }) {
  const entry = AUDIT_LOG.find((e) => e.id === id);
  if (!entry) return <NotFound />;

  const tone = resultTone(entry.result);
  const hasDiff = !!(entry.before || entry.after);

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
                Control plane · รายการตรวจสอบ
              </span>
              <h1 className="text-h5 text-foreground">
                {actionLabel(entry.action)}
              </h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {entry.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge
              tone={tone}
              label={RESULT_LABEL[entry.result]}
            />
            <span className="inline-flex items-center gap-1 rounded-md bg-grey-100 px-1.5 py-1 text-xs font-semibold text-grey-700 dark:bg-grey-900">
              <Lock className="size-3.5 text-grey-500" />
              อ่านอย่างเดียว · เพิ่มต่อท้ายเท่านั้น
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField
              label="ทรัพยากร"
              value={entry.entityId}
              mono
              className="col-span-2"
            />
            <ReadField label="บริษัท" value={TENANT_LABEL[entry.tenantId]} />
            <ReadField
              label="เวลา"
              value={formatDateTime(entry.timestamp)}
              mono
            />
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="เหตุการณ์"
          icon={<FileClock className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField
              label="ผู้กระทำ"
              value={entry.actor}
              mono
              className="sm:col-span-2"
            />
            <ReadField
              label="การกระทำ"
              value={entry.action}
              mono
              className="sm:col-span-2"
            />
            <ReadField label="บริษัท" value={TENANT_LABEL[entry.tenantId]} />
            <ReadField label="ผลลัพธ์" value={RESULT_LABEL[entry.result]} />
            <ReadField label="IP" value={entry.ip} mono />
          </div>
        </DetailCard>

        {hasDiff ? (
          <DetailCard
            title="การเปลี่ยนแปลง"
            icon={<GitCompareArrows className="size-5 text-grey-600" />}
          >
            <p className="mb-4 text-sm text-grey-600">
              สถานะก่อนและหลังการกระทำ — บันทึกไว้ถาวร แก้ไขย้อนหลังไม่ได้
            </p>
            <div className="grid gap-5">
              <ReadField
                label="ก่อน"
                value={
                  <pre className="text-data mt-1 overflow-x-auto rounded-xl border border-[var(--divider)] bg-grey-100 p-3 text-xs text-grey-700 dark:bg-grey-900">
                    {entry.before ?? "—"}
                  </pre>
                }
              />
              <ReadField
                label="หลัง"
                value={
                  <pre className="text-data mt-1 overflow-x-auto rounded-xl border border-[var(--divider)] bg-grey-100 p-3 text-xs text-grey-700 dark:bg-grey-900">
                    {entry.after ?? "—"}
                  </pre>
                }
              />
            </div>
          </DetailCard>
        ) : null}
      </div>
    </div>
  );
}
