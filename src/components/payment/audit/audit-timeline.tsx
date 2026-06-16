"use client";

import { Calendar, Globe, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditLog, AuditAction } from "@/types/audit";
import {
  AUDIT_ACTION_CONFIG,
  TONE_CLASSES,
  FALLBACK_ICON,
} from "./audit-action-config";
import { AUDIT_ENTITY_LABELS } from "./audit-filter-bar";

interface AuditTimelineProps {
  grouped: [string, AuditLog[]][];
  onSelect: (event: AuditLog) => void;
}

function getActionConfig(action: AuditAction) {
  return (
    AUDIT_ACTION_CONFIG[action] ?? {
      label: action,
      tone: "neutral" as const,
      Icon: FALLBACK_ICON,
    }
  );
}

function formatTime(isoTs: string): string {
  return new Date(isoTs).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AuditTimeline({ grouped, onSelect }: AuditTimelineProps) {
  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-grey-500">
        <History className="size-10 stroke-[1.5]" />
        <p className="text-sm font-semibold">ไม่พบกิจกรรม</p>
        <p className="text-sm">ลองล้างตัวกรองหรือขยายช่วงเวลา</p>
      </div>
    );
  }

  return (
    <div>
      {grouped.map(([day, events]) => (
        <div key={day}>
          {/* Sticky day header — top-[72px] matches the 72px topbar */}
          <div className="sticky top-[72px] z-10 flex items-center gap-2 border-b border-border bg-muted/70 px-5 py-2.5 backdrop-blur-sm">
            <Calendar className="size-3.5 text-grey-500" />
            <span className="text-sm font-semibold text-grey-600">{day}</span>
            <span className="ml-auto text-xs font-medium text-grey-500">
              {events.length} เหตุการณ์
            </span>
          </div>

          {/* Events */}
          {events.map((e) => {
            const cfg = getActionConfig(e.action);
            const tone = TONE_CLASSES[cfg.tone];
            const Icon = cfg.Icon;

            return (
              <div
                key={e.id}
                onClick={() => onSelect(e)}
                className="flex cursor-pointer items-start gap-3 border-b border-border px-5 py-3.5 transition-colors hover:bg-muted/50"
              >
                {/* Action icon chip */}
                <div
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-[9px]",
                    tone.bg,
                    tone.text,
                  )}
                >
                  <Icon className="size-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Top row */}
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold">{e.actor.name}</span>
                    <span className="text-sm text-grey-500">
                      {cfg.label} {AUDIT_ENTITY_LABELS[e.entity]}
                    </span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-grey-600">
                      {e.entityId}
                    </code>
                    <span className="ml-auto shrink-0 text-xs tabular-nums text-grey-500">
                      {formatTime(e.ts)}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="mt-0.5 text-sm text-grey-600">{e.summary}</p>

                  {/* Meta row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-grey-500">
                    <span className="flex items-center gap-0.5">
                      <Globe className="size-3 shrink-0" />
                      {e.ip}
                    </span>
                    <span>{e.ua}</span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded border px-1.5 py-px text-xs font-semibold",
                        e.actor.portal === "admin"
                          ? "border-primary/20 bg-primary/8 text-primary dark:border-primary/30 dark:bg-primary/15"
                          : "border-info/20 bg-info/8 text-info-dark dark:border-info/30 dark:bg-info/15",
                      )}
                    >
                      {e.actor.portal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
