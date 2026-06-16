"use client";

import { Search, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AuditAction, AuditEntity, AuditActor } from "@/types/audit";

export type TimeRange = "today" | "7d" | "30d" | "90d" | "custom";

export const AUDIT_ACTION_LABELS: Record<AuditAction, { label: string }> = {
  create:  { label: "สร้าง" },
  update:  { label: "อัปเดต" },
  delete:  { label: "ลบ" },
  approve: { label: "อนุมัติ" },
  reject:  { label: "ปฏิเสธ" },
  login:   { label: "เข้าสู่ระบบ" },
  logout:  { label: "ออกจากระบบ" },
  capture: { label: "Capture" },
  void:    { label: "Void" },
  refund:  { label: "คืนเงิน" },
  export:  { label: "ส่งออก" },
  send:    { label: "ส่ง" },
};

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  payment_link: "ลิงก์ชำระเงิน",
  transaction:  "ธุรกรรม",
  policy:       "กรมธรรม์",
  user:         "ผู้ใช้งาน",
  role:         "บทบาท",
  apiclient:    "API Client",
  psp:          "PSP",
  webhook:      "Webhook",
  report:       "รายงาน",
  config:       "การตั้งค่า",
};

const TIME_CHIPS: { k: TimeRange; label: string }[] = [
  { k: "today",  label: "วันนี้" },
  { k: "7d",     label: "7 วัน" },
  { k: "30d",    label: "30 วัน" },
  { k: "90d",    label: "90 วัน" },
  { k: "custom", label: "กำหนดเอง" },
];

interface AuditFilterBarProps {
  timeRange: TimeRange;
  search: string;
  actionFilter: "all" | AuditAction;
  entityFilter: "all" | AuditEntity;
  actorFilter: "all" | string;
  actors: AuditActor[];
  onTimeRangeChange: (v: TimeRange) => void;
  onSearchChange: (v: string) => void;
  onActionChange: (v: "all" | AuditAction) => void;
  onEntityChange: (v: "all" | AuditEntity) => void;
  onActorChange: (v: "all" | string) => void;
  onExport: () => void;
}

export function AuditFilterBar({
  timeRange,
  search,
  actionFilter,
  entityFilter,
  actorFilter,
  actors,
  onTimeRangeChange,
  onSearchChange,
  onActionChange,
  onEntityChange,
  onActorChange,
  onExport,
}: AuditFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5">
      {/* Time chips */}
      <div className="flex flex-wrap gap-1.5">
        {TIME_CHIPS.map((c) => (
          <button
            key={c.k}
            onClick={() => onTimeRangeChange(c.k)}
            className={cn(
              "rounded-lg px-3 py-1 text-sm font-medium transition-colors",
              timeRange === c.k
                ? "bg-primary text-white"
                : "bg-muted text-grey-600 hover:bg-grey-200 dark:hover:bg-grey-700",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search + selects + export */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-4 text-grey-500 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหา ID, ผู้กระทำ, IP, รายละเอียด..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-72 rounded-lg border border-border bg-transparent pl-8 pr-8 text-sm text-foreground placeholder:text-grey-500 outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 grid size-4 place-items-center text-grey-500 hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Action filter */}
        <Select
          value={actionFilter}
          onValueChange={(v) => onActionChange(v as "all" | AuditAction)}
        >
          <SelectTrigger className="h-8 w-[160px] text-sm">
            <SelectValue placeholder="ทุก Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Action</SelectItem>
            {(Object.entries(AUDIT_ACTION_LABELS) as [AuditAction, { label: string }][]).map(
              ([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        {/* Entity filter */}
        <Select
          value={entityFilter}
          onValueChange={(v) => onEntityChange(v as "all" | AuditEntity)}
        >
          <SelectTrigger className="h-8 w-[180px] text-sm">
            <SelectValue placeholder="ทุก Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Entity</SelectItem>
            {(Object.entries(AUDIT_ENTITY_LABELS) as [AuditEntity, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Actor filter */}
        <Select
          value={actorFilter}
          onValueChange={(v) => onActorChange(v as "all" | string)}
        >
          <SelectTrigger className="h-8 w-[190px] text-sm">
            <SelectValue placeholder="ทุกผู้กระทำ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกผู้กระทำ</SelectItem>
            {actors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {/* Export */}
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="size-3.5" />
          ส่งออก
        </Button>
      </div>
    </div>
  );
}
