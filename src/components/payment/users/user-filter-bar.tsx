"use client";

import { useId } from "react";
import { Search, X, Download, UserPlus, CheckCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserStatus, UserPortal } from "@/types/user";

export type UserTab = UserStatus | "all";

interface TabCounts {
  all: number;
  pending: number;
  active: number;
  disabled: number;
}

interface UserFilterBarProps {
  tab: UserTab;
  portal: UserPortal | "all";
  search: string;
  counts: TabCounts;
  selectedCount: number;
  onTabChange: (tab: UserTab) => void;
  onPortalChange: (portal: UserPortal | "all") => void;
  onSearchChange: (s: string) => void;
  onBulkApprove: () => void;
  onBulkEmail: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  onInvite: () => void;
}

const TABS: Array<{ key: UserTab; label: string }> = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รออนุมัติ" },
  { key: "active", label: "ใช้งานอยู่" },
  { key: "disabled", label: "ปิดใช้งาน" },
];

const PORTALS: Array<{ key: UserPortal | "all"; label: string }> = [
  { key: "all", label: "ทุก Portal" },
  { key: "admin", label: "Admin" },
  { key: "merchant", label: "Merchant" },
];

export function UserFilterBar({
  tab,
  portal,
  search,
  counts,
  selectedCount,
  onTabChange,
  onPortalChange,
  onSearchChange,
  onBulkApprove,
  onBulkEmail,
  onClearSelection,
  onExport,
  onInvite,
}: UserFilterBarProps) {
  const searchId = useId();
  return (
    <div className="flex flex-col gap-3 border-b border-[rgba(145,158,171,0.12)] px-5 py-3.5">
      {/* Status tabs + portal chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
              tab === key
                ? "bg-foreground text-background"
                : "text-grey-600 hover:bg-grey-100 dark:hover:bg-grey-800",
            )}
          >
            {label}
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-xs font-bold tabular-nums",
                tab === key
                  ? "bg-white/20 text-white"
                  : "bg-grey-200 text-grey-600 dark:bg-grey-700 dark:text-grey-400",
              )}
            >
              {counts[key as keyof TabCounts]}
            </span>
          </button>
        ))}

        <span className="mx-1 h-[22px] w-px bg-grey-200 dark:bg-grey-700" />

        {PORTALS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onPortalChange(key)}
            className={cn(
              "inline-flex h-7 items-center rounded-md px-3 text-sm font-medium transition-colors",
              portal === key
                ? "bg-foreground text-background"
                : "text-grey-600 hover:bg-grey-100 dark:hover:bg-grey-800",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex w-80 items-center">
          <Label id={searchId} className="sr-only">
            ค้นหา
          </Label>
          <Search className="absolute left-3 size-4 text-grey-500 pointer-events-none" />
          <Input
            aria-labelledby={searchId}
            placeholder="ค้นหาชื่อ, อีเมล, รหัสพนักงาน, รหัสตัวแทน..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 inline-flex size-5 items-center justify-center rounded text-grey-500 hover:text-grey-800"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
          <Download className="size-3.5" />
          ส่งออก
        </Button>
        <Button size="sm" onClick={onInvite} className="gap-1.5">
          <UserPlus className="size-3.5" />
          เชิญผู้ใช้
        </Button>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2.5">
          <span className="text-sm font-semibold text-primary">
            <CheckCircle className="mr-1 inline size-3.5 align-[-2px]" />
            เลือก {selectedCount} รายการ
          </span>
          <Button
            size="sm"
            variant="default"
            onClick={onBulkApprove}
            className="gap-1 bg-success text-white hover:bg-success/90"
          >
            <CheckCircle className="size-3.5" />
            อนุมัติทั้งหมด
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkEmail}
            className="gap-1"
          >
            <Mail className="size-3.5" />
            ส่งอีเมล
          </Button>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            ยกเลิก
          </Button>
        </div>
      )}
    </div>
  );
}
