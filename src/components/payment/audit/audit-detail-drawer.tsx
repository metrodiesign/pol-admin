"use client";

import { Info, Copy, Check, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/payment/toast/toast-provider";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EntityDrawer } from "@/components/payment/entity-drawer";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types/audit";
import {
  AUDIT_ACTION_CONFIG,
  TONE_CLASSES,
  FALLBACK_ICON,
} from "./audit-action-config";
import { AUDIT_ENTITY_LABELS } from "./audit-filter-bar";

interface AuditDetailDrawerProps {
  event: AuditLog | null;
  onClose: () => void;
}

function formatFullDate(isoTs: string): string {
  return new Date(isoTs).toLocaleString("th-TH", {
    dateStyle: "full",
    timeStyle: "medium",
  });
}

/** Minimal diff shown for "update" events */
function renderDiff(event: AuditLog): string {
  return `{
-  "status": "pending",
+  "status": "approved",
+  "approvedBy": "${event.actor.name}",
+  "approvedAt": "${event.ts}"
}`;
}

export function AuditDetailDrawer({ event, onClose }: AuditDetailDrawerProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const isOpen = event !== null;

  async function handleCopy() {
    if (!event) return;
    try {
      await navigator.clipboard.writeText(event.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("คัดลอก Event ID แล้ว", { description: event.id });
    } catch {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  }

  const cfg = event
    ? (AUDIT_ACTION_CONFIG[event.action] ?? {
        label: event.action,
        tone: "neutral" as const,
        Icon: FALLBACK_ICON,
      })
    : null;
  const tone = cfg ? TONE_CLASSES[cfg.tone] : null;
  const entityLabel = event ? AUDIT_ENTITY_LABELS[event.entity] : null;
  const Icon = cfg?.Icon ?? FALLBACK_ICON;

  const rows: { label: string; value: string; mono?: boolean }[] = event
    ? [
        { label: "เวลา",       value: formatFullDate(event.ts) },
        { label: "Action",     value: event.action,                         mono: true },
        { label: "Entity",     value: `${entityLabel} (${event.entity})` },
        { label: "Entity ID",  value: event.entityId,                       mono: true },
        { label: "ผู้กระทำ",   value: `${event.actor.name} (${event.actor.id})` },
        { label: "Portal",     value: event.actor.portal },
        { label: "IP Address", value: event.ip,                             mono: true },
        { label: "User-Agent", value: event.ua },
      ]
    : [];

  const drawerHeader = event ? (
    <>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-widest text-grey-500">
          เหตุการณ์
        </div>
        <SheetTitle className="mt-px font-mono text-sm font-bold">
          {event.id}
        </SheetTitle>
        <SheetDescription className="sr-only">
          รายละเอียด audit event {event.id}
        </SheetDescription>
      </div>
      <button
        onClick={handleCopy}
        aria-label="คัดลอก ID"
        className="grid size-8 place-items-center rounded-full text-grey-500 hover:bg-muted transition-colors"
      >
        {copied ? (
          <Check className="size-4 text-success-dark" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
      <button
        onClick={onClose}
        aria-label="ปิด"
        className="grid size-8 place-items-center rounded-full text-grey-500 hover:bg-muted transition-colors"
      >
        <span className="sr-only">ปิด</span>
        <X className="size-4" />
      </button>
    </>
  ) : null;

  return (
    <EntityDrawer
      open={isOpen}
      onOpenChange={(o) => { if (!o) onClose(); }}
      header={drawerHeader ?? undefined}
      showCloseButton={false}
      width="sm:max-w-[540px]"
    >
      {event && cfg && tone && (
        <>
          {/* Action header block */}
          <div
            className={cn(
              "mb-5 flex items-center gap-3 rounded-xl border p-4",
              tone.bg,
              tone.border,
            )}
          >
            <div
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-[11px] text-white",
                tone.solidBg,
              )}
            >
              <Icon className="size-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold">
                {cfg.label} {entityLabel}
              </p>
              <p className="mt-0.5 text-sm text-grey-600">{event.summary}</p>
            </div>
          </div>

          {/* Detail rows */}
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={cn(
                "flex items-start gap-3 py-2.5",
                i < rows.length - 1 && "border-b border-border",
              )}
            >
              <p className="w-[110px] shrink-0 text-sm text-grey-500">{r.label}</p>
              <p
                className={cn(
                  "flex-1 break-words text-sm font-medium",
                  r.mono && "font-mono",
                )}
              >
                {r.value}
              </p>
            </div>
          ))}

          {/* JSON diff — only for update events */}
          {event.action === "update" && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-500">
                การเปลี่ยนแปลง
              </p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted px-3 py-3 font-mono text-sm text-grey-600">
                {renderDiff(event)}
              </pre>
            </div>
          )}

          {/* Retention notice */}
          <div className="mt-5 flex gap-2.5 rounded-lg border border-border bg-muted px-3 py-3 text-sm text-grey-500">
            <Info className="mt-px size-4 shrink-0 text-primary" />
            <span>
              Audit log เป็น immutable record — เก็บไว้ใน hot storage 90 วัน
              หลังจากนั้น archive ไปยัง cold storage 7 ปี
            </span>
          </div>
        </>
      )}
    </EntityDrawer>
  );
}
