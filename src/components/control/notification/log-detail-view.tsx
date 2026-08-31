"use client";

import Link from "next/link";
import type { NotificationLogEntry } from "@/types/control/notification";
import { NOTIFICATION_LOG } from "@/lib/mock/control/notifications";
import {
  CHANNEL_LABEL,
  LOG_STATUS_LABEL,
  eventLabel,
  logTone,
} from "@/lib/control/notification";
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

function logById(
  rows: NotificationLogEntry[],
  id?: string,
): NotificationLogEntry | undefined {
  if (!id) return undefined;
  return rows.find((e) => e.id === id);
}

function Header({ id }: { id?: string }) {
  return (
    <EditPageHeader
      title="รายละเอียดการส่งแจ้งเตือน"
      backHref="/control/notifications"
      breadcrumbs={[
        { label: "การแจ้งเตือน", href: "/control/notifications" },
        { label: id ?? "รายละเอียด" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/control/notifications" className={cancelClass}>
            ยกเลิก
          </Link>
        </div>
      }
    />
  );
}

export function NotificationLogDetailView({ id }: { id?: string }) {
  const entry = logById(NOTIFICATION_LOG, id);
  if (!entry) {
    return (
      <>
        <Header id={id} />
        <DetailNotFound
          title="ไม่พบรายการแจ้งเตือนนี้"
          message="รหัสการส่งอาจไม่ถูกต้องหรือถูกลบไปแล้ว"
        />
      </>
    );
  }

  const tone = logTone(entry.status);

  return (
    <>
      <Header id={entry.id} />

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        <DetailIdentity
          title={eventLabel(entry.event)}
          subtitle={`${CHANNEL_LABEL[entry.channel]} · ${entry.target}`}
          code={entry.id}
          badges={<ControlStatusBadge tone={tone} label={LOG_STATUS_LABEL[entry.status]} />}
        />

        <DetailSection title="รายละเอียดการส่ง">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label="เหตุการณ์" value={eventLabel(entry.event)} />
            <ReadField label="ช่องทาง" value={CHANNEL_LABEL[entry.channel]} />
            <ReadField label="ปลายทาง" value={entry.target} mono />
            <ReadField label="สถานะ" value={LOG_STATUS_LABEL[entry.status]} />
            <ReadField label="ส่งเมื่อ" value={formatDateTime(entry.sentAt)} mono />
          </div>
        </DetailSection>
      </div>
    </>
  );
}
