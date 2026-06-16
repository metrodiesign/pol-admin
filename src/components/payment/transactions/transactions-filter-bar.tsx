"use client";

import { useId } from "react";
import { Search, X, SlidersHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  TxnStatusFilter,
  TxnOriginFilter,
  TxnPspFilter,
} from "./use-transactions-table";
import type { TransactionStatus } from "@/types/transaction";

const STATUS_CHIPS: { key: TxnStatusFilter; label: string }[] = [
  { key: "all",        label: "ทั้งหมด" },
  { key: "succeeded",  label: "สำเร็จ" },
  { key: "pending",    label: "รอชำระ" },
  { key: "processing", label: "กำลังประมวลผล" },
  { key: "failed",     label: "ล้มเหลว" },
  { key: "refunded",   label: "คืนเงิน" },
  { key: "voided",     label: "ยกเลิก" },
];

const ORIGIN_OPTIONS: { value: TxnOriginFilter; label: string }[] = [
  { value: "all",    label: "ที่มา: ทั้งหมด" },
  { value: "branch", label: "เฉพาะสาขา" },
  { value: "staff",  label: "เฉพาะพนักงานประจำสาขา" },
  { value: "agent",  label: "เฉพาะตัวแทน" },
  { value: "broker", label: "เฉพาะนายหน้า" },
  { value: "app",    label: "เฉพาะแอปเชื่อมต่อ" },
];

const PSP_OPTIONS: { value: TxnPspFilter; label: string }[] = [
  { value: "all",   label: "PSP: ทั้งหมด" },
  { value: "2C2P",  label: "2C2P" },
  { value: "Omise", label: "Omise" },
];

interface TransactionsFilterBarProps {
  statusFilter: TxnStatusFilter;
  originFilter: TxnOriginFilter;
  pspFilter: TxnPspFilter;
  search: string;
  dateFrom: string;
  dateTo: string;
  statusCounts: Record<TxnStatusFilter, number>;
  filteredCount: number;
  hasActiveFilters: boolean;
  onStatusChange: (v: TxnStatusFilter) => void;
  onOriginChange: (v: TxnOriginFilter) => void;
  onPspChange: (v: TxnPspFilter) => void;
  onSearchChange: (v: string) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onClearFilters: () => void;
}

export function TransactionsFilterBar({
  statusFilter,
  originFilter,
  pspFilter,
  search,
  dateFrom,
  dateTo,
  statusCounts,
  hasActiveFilters,
  onStatusChange,
  onOriginChange,
  onPspChange,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: TransactionsFilterBarProps) {
  const searchId = useId();
  return (
    <div className="border-b border-dashed border-grey-200 px-5 py-3.5 flex flex-col gap-3">
      {/* Status chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_CHIPS.map((chip) => {
          const count =
            chip.key === "all"
              ? statusCounts.all
              : statusCounts[chip.key as TransactionStatus] ?? 0;
          const active = statusFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onStatusChange(chip.key)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
                active
                  ? "bg-grey-900 text-white dark:bg-white dark:text-grey-900"
                  : "bg-grey-100 text-grey-600 hover:bg-grey-200 dark:bg-grey-800 dark:text-grey-300 dark:hover:bg-grey-700"
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  active
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-grey-900"
                    : "bg-grey-300/60 text-grey-600 dark:bg-grey-700 dark:text-grey-300"
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

      {/* Search + selects */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex min-w-[220px] flex-1 items-center sm:max-w-[280px]">
          <Label id={searchId} className="sr-only">
            ค้นหาธุรกรรม
          </Label>
          <Search className="pointer-events-none absolute left-3 size-4 text-grey-500" />
          <Input
            aria-labelledby={searchId}
            placeholder="ค้นหารหัสธุรกรรม, ลูกค้า..."
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

        {/* Originator select */}
        <Select
          value={originFilter}
          onValueChange={(v) => onOriginChange(v as TxnOriginFilter)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORIGIN_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* PSP select */}
        <Select
          value={pspFilter}
          onValueChange={(v) => onPspChange(v as TxnPspFilter)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PSP_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="h-8 rounded-lg border border-grey-300 bg-transparent px-2.5 text-sm text-foreground transition-colors outline-none focus:border-grey-800 dark:border-grey-700 dark:bg-transparent"
          aria-label="วันที่เริ่มต้น"
        />
        <span className="text-grey-500 text-sm">–</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="h-8 rounded-lg border border-grey-300 bg-transparent px-2.5 text-sm text-foreground transition-colors outline-none focus:border-grey-800 dark:border-grey-700 dark:bg-transparent"
          aria-label="วันที่สิ้นสุด"
        />

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            ตัวกรองเพิ่มเติม
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            ส่งออก CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
