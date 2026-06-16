"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/payment/toast/toast-provider";
import { AuditStats } from "./audit-stats";
import { AuditFilterBar, type TimeRange } from "./audit-filter-bar";
import { AuditTimeline } from "./audit-timeline";
import { AuditDetailDrawer } from "./audit-detail-drawer";
import type { AuditLog, AuditAction, AuditEntity, AuditActor } from "@/types/audit";

interface AuditLogViewProps {
  logs: AuditLog[];
}

const SENSITIVE_ACTIONS: AuditAction[] = ["delete", "approve", "refund", "void"];
const REFERENCE_DATE = new Date("2026-05-24");

function isSameDay(isoTs: string, ref: Date): boolean {
  const d = new Date(isoTs);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function formatDayLabel(isoTs: string): string {
  return new Date(isoTs).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AuditLogView({ logs }: AuditLogViewProps) {
  const toast = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"all" | AuditAction>("all");
  const [entityFilter, setEntityFilter] = useState<"all" | AuditEntity>("all");
  const [actorFilter, setActorFilter] = useState<"all" | string>("all");
  const [selectedEvent, setSelectedEvent] = useState<AuditLog | null>(null);

  /** Unique actors derived from full log (stable reference) */
  const actors = useMemo<AuditActor[]>(() => {
    const seen = new Map<string, AuditActor>();
    logs.forEach((e) => seen.set(e.actor.id, e.actor));
    return [...seen.values()];
  }, [logs]);

  /** Stats from full log */
  const stats = useMemo(
    () => ({
      today: logs.filter((e) => isSameDay(e.ts, REFERENCE_DATE)).length,
      loginCount: logs.filter((e) => e.action === "login").length,
      sensitiveCount: logs.filter((e) =>
        SENSITIVE_ACTIONS.includes(e.action),
      ).length,
      activeActors: actors.length,
    }),
    [logs, actors],
  );

  /** Filtered list */
  const filtered = useMemo(() => {
    return logs.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (entityFilter !== "all" && e.entity !== entityFilter) return false;
      if (actorFilter !== "all" && e.actor.id !== actorFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !e.id.toLowerCase().includes(s) &&
          !e.entityId.toLowerCase().includes(s) &&
          !e.actor.name.toLowerCase().includes(s) &&
          !e.summary.toLowerCase().includes(s) &&
          !e.ip.includes(s)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [logs, actionFilter, entityFilter, actorFilter, search]);

  /** Grouped by day */
  const grouped = useMemo<[string, AuditLog[]][]>(() => {
    const map = new Map<string, AuditLog[]>();
    filtered.forEach((e) => {
      const key = formatDayLabel(e.ts);
      const arr = map.get(key);
      if (arr) {
        arr.push(e);
      } else {
        map.set(key, [e]);
      }
    });
    return [...map.entries()];
  }, [filtered]);

  function handleExport() {
    // In a real app, trigger CSV download. No-op in mock.
    toast.success("ส่งออกสำเร็จ", {
      description: `ส่งออก ${filtered.length} รายการแล้ว`,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <AuditStats
        today={stats.today}
        loginCount={stats.loginCount}
        sensitiveCount={stats.sensitiveCount}
        activeActors={stats.activeActors}
      />

      {/* Main card */}
      <Card className="gap-0 py-0 overflow-hidden">
        <AuditFilterBar
          timeRange={timeRange}
          search={search}
          actionFilter={actionFilter}
          entityFilter={entityFilter}
          actorFilter={actorFilter}
          actors={actors}
          onTimeRangeChange={setTimeRange}
          onSearchChange={setSearch}
          onActionChange={setActionFilter}
          onEntityChange={setEntityFilter}
          onActorChange={setActorFilter}
          onExport={handleExport}
        />

        <AuditTimeline grouped={grouped} onSelect={setSelectedEvent} />
      </Card>

      {/* Detail drawer */}
      <AuditDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
