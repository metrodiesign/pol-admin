"use client";

import { Send } from "lucide-react";
import type { NotificationLogEntry } from "@/types/notification";
import { NOTIFICATION_LOG } from "@/lib/mock/notifications";
import {
  CHANNEL_LABEL,
  LOG_STATUS_LABEL,
  eventLabel,
  logTone,
} from "@/lib/control/notification";
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
      <p className="text-h6 text-foreground">ไม่พบรายการแจ้งเตือนนี้</p>
      <p className="mt-1 text-sm text-grey-600">
        รหัสการส่งอาจไม่ถูกต้องหรือถูกลบไปแล้ว
      </p>
    </div>
  );
}

function logById(
  rows: NotificationLogEntry[],
  id?: string,
): NotificationLogEntry | undefined {
  if (!id) return undefined;
  return rows.find((e) => e.id === id);
}

export function NotificationLogDetailView({ id }: { id?: string }) {
  const entry = logById(NOTIFICATION_LOG, id);
  if (!entry) return <NotFound />;

  const tone = logTone(entry.status);

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
                Control plane · Notification log
              </span>
              <h1 className="text-h5 text-foreground">
                {eventLabel(entry.event)}
              </h1>
              <p className="text-data mt-1 text-xs break-all text-grey-600">
                {entry.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlStatusBadge
              tone={tone}
              label={LOG_STATUS_LABEL[entry.status]}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--divider)] pt-5">
            <ReadField label="ปลายทาง" value={entry.target} mono />
            <ReadField
              label="ส่งเมื่อ"
              value={formatDateTime(entry.sentAt)}
              mono
            />
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-6 mmd:col-span-8">
        <DetailCard
          title="รายละเอียดการส่ง"
          icon={<Send className="size-5 text-grey-600" />}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <ReadField label="เหตุการณ์" value={eventLabel(entry.event)} />
            <ReadField label="ช่องทาง" value={CHANNEL_LABEL[entry.channel]} />
            <ReadField
              label="ปลายทาง"
              value={entry.target}
              mono
              className="sm:col-span-2"
            />
            <ReadField label="สถานะ" value={LOG_STATUS_LABEL[entry.status]} />
            <ReadField
              label="ส่งเมื่อ"
              value={formatDateTime(entry.sentAt)}
              mono
            />
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
