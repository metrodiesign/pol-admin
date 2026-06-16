"use client";

import { Search, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RolePortal } from "@/types/role";
import type { RolesPortalFilter } from "./use-roles-table";

interface RolesFilterBarProps {
  portalFilter: RolesPortalFilter;
  search: string;
  portalCounts: { all: number; admin: number; merchant: number };
  onPortalChange: (v: RolesPortalFilter) => void;
  onSearchChange: (v: string) => void;
  onExport: () => void;
  onAddNew: (portal: RolePortal) => void;
}

const PORTAL_CHIPS = [
  { k: "all" as const, label: "ทุก Portal" },
  { k: "admin" as const, label: "Admin" },
  { k: "merchant" as const, label: "Merchant" },
] as const;

export function RolesFilterBar({
  portalFilter,
  search,
  portalCounts,
  onPortalChange,
  onSearchChange,
  onExport,
  onAddNew,
}: RolesFilterBarProps) {
  return (
    <>
      {/* Portal chips */}
      <div className="border-b border-[rgba(145,158,171,0.12)] px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {PORTAL_CHIPS.map((c) => (
            <button
              key={c.k}
              onClick={() => onPortalChange(c.k)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                portalFilter === c.k
                  ? "bg-primary/10 text-primary"
                  : "text-grey-600 hover:bg-grey-200",
              )}
            >
              {c.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  portalFilter === c.k
                    ? "bg-primary text-white"
                    : "bg-grey-300 text-grey-700",
                )}
              >
                {portalCounts[c.k]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search + action buttons */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-[rgba(145,158,171,0.12)] px-5 py-3.5">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-grey-300 px-3 min-w-[220px] max-w-80">
          <Search className="size-4 shrink-0 text-grey-500" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ Role, รหัส, คำอธิบาย..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-grey-500 outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="text-grey-500 hover:text-foreground"
              aria-label="ล้างคำค้น"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
          <Download className="size-3.5" />
          ส่งออก
        </Button>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() =>
            onAddNew(portalFilter === "all" ? "admin" : portalFilter)
          }
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          เพิ่ม Role ใหม่
        </Button>
      </div>
    </>
  );
}
