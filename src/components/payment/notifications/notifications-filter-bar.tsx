"use client";

import { useId } from "react";
import { Search, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { NotifChannelFilter, NotifStatusFilter } from "./use-notifications-table";

const CHANNEL_CHIPS: { key: NotifChannelFilter; label: string }[] = [
  { key: "all",   label: "ทั้งหมด" },
  { key: "sms",   label: "SMS" },
  { key: "email", label: "อีเมล" },
];

const STATUS_CHIPS: { key: NotifStatusFilter; label: string }[] = [
  { key: "all",    label: "สถานะ: ทั้งหมด" },
  { key: "sent",   label: "ส่งสำเร็จ" },
  { key: "queued", label: "รอส่ง" },
  { key: "failed", label: "ส่งไม่สำเร็จ" },
];

interface NotificationsFilterBarProps {
  channelFilter: NotifChannelFilter;
  statusFilter: NotifStatusFilter;
  search: string;
  channelCounts: Record<NotifChannelFilter, number>;
  hasActiveFilters: boolean;
  onChannelChange: (v: NotifChannelFilter) => void;
  onStatusChange: (v: NotifStatusFilter) => void;
  onSearchChange: (v: string) => void;
  onClearFilters: () => void;
}

export function NotificationsFilterBar({
  channelFilter,
  statusFilter,
  search,
  channelCounts,
  hasActiveFilters,
  onChannelChange,
  onStatusChange,
  onSearchChange,
  onClearFilters,
}: NotificationsFilterBarProps) {
  const searchId = useId();
  return (
    <div className="border-b border-dashed border-grey-200 dark:border-grey-800 px-5 py-3.5 flex flex-col gap-3">
      {/* Channel chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {CHANNEL_CHIPS.map((chip) => {
          const count = channelCounts[chip.key] ?? 0;
          const active = channelFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChannelChange(chip.key)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
                active
                  ? "bg-grey-900 text-white dark:bg-white dark:text-grey-900"
                  : "bg-grey-100 text-grey-600 hover:bg-grey-200 dark:bg-grey-800 dark:text-grey-300 dark:hover:bg-grey-700",
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  active
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-grey-900"
                    : "bg-grey-300/60 text-grey-600 dark:bg-grey-700 dark:text-grey-300",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-grey-600 hover:bg-grey-100 dark:hover:bg-grey-800 transition-colors"
          >
            <X className="size-3" strokeWidth={2.5} />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Search + status + export */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex min-w-[220px] flex-1 items-center sm:max-w-[280px]">
          <Label id={searchId} className="sr-only">
            ค้นหา
          </Label>
          <Search className="pointer-events-none absolute left-3 size-4 text-grey-500" />
          <Input
            aria-labelledby={searchId}
            placeholder="ค้นหาผู้รับ, หัวเรื่อง, originator..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 flex size-5 items-center justify-center text-grey-500 hover:text-grey-700 transition-colors"
              aria-label="ล้างคำค้น"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange(v as NotifStatusFilter)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="สถานะ: ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_CHIPS.map((o) => (
              <SelectItem key={o.key} value={o.key}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            ส่งออก CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
