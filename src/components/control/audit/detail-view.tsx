"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { AUDIT_LOG } from "@/lib/mock/control/audit-log";
import { RESULT_LABEL, resultTone, actionLabel } from "@/lib/control/audit";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { formatDateTime } from "@/lib/control/format";
import {
  DetailIdentity,
  DetailNotFound,
  DetailSection,
} from "@/components/control/shared/detail-shell";
import { ReadField } from "@/components/control/shared/read-field";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { cancelClass, cardStyle } from "@/components/control/shared/styles";
import { EditPageHeader } from "@/components/shared/edit-page-header";

function Header({ id }: { id?: string }) {
  return (
    <EditPageHeader
      title="รายละเอียด Audit Log"
      backHref="/control/audit"
      breadcrumbs={[
        { label: "บันทึกการตรวจสอบ", href: "/control/audit" },
        { label: id ?? "รายละเอียด" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/control/audit" className={cancelClass}>
            ยกเลิก
          </Link>
        </div>
      }
    />
  );
}

export function AuditDetailView({ id }: { id?: string }) {
  const entry = AUDIT_LOG.find((e) => e.id === id);
  if (!entry) {
    return (
      <>
        <Header id={id} />
        <DetailNotFound
          title="ไม่พบบันทึกการตรวจสอบนี้"
          message="รหัสบันทึกอาจไม่ถูกต้อง — บันทึกการตรวจสอบเป็นแบบเพิ่มต่อท้ายเท่านั้น ลบไม่ได้"
        />
      </>
    );
  }

  const tone = resultTone(entry.result);
  const hasDiff = !!(entry.before || entry.after);

  return (
    <>
      <Header id={entry.id} />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        <DetailIdentity
          title={actionLabel(entry.action)}
          subtitle={`${entry.actor} · ${MERCHANT_LABEL[entry.merchantId]}`}
          code={entry.id}
          badges={
            <>
              <ControlStatusBadge tone={tone} label={RESULT_LABEL[entry.result]} />
              <span className="inline-flex items-center gap-1 rounded-md bg-grey-100 px-1.5 py-1 text-xs font-semibold text-grey-700 dark:bg-grey-900">
                <Lock className="size-3.5 text-grey-500" />
                อ่านอย่างเดียว · เพิ่มต่อท้ายเท่านั้น
              </span>
            </>
          }
        />

        <DetailSection title="เหตุการณ์">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="ผู้กระทำ" value={entry.actor} mono />
            <ReadField label="การกระทำ" value={entry.action} mono />
            <ReadField label="ทรัพยากร" value={entry.entityId} mono />
            <ReadField label="บริษัท" value={MERCHANT_LABEL[entry.merchantId]} />
            <ReadField label="ผลลัพธ์" value={RESULT_LABEL[entry.result]} />
            <ReadField label="เวลา" value={formatDateTime(entry.timestamp)} mono />
            <ReadField label="IP" value={entry.ip} mono />
          </div>
        </DetailSection>

        {hasDiff ? (
          <DetailSection
            title="การเปลี่ยนแปลง"
            description="สถานะก่อนและหลังการกระทำ — บันทึกไว้ถาวร แก้ไขย้อนหลังไม่ได้"
          >
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
          </DetailSection>
        ) : null}
      </div>
    </>
  );
}
