"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { TextField } from "@/components/form/text-field";

interface RbacRolesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function RbacRolesToolbar({
  search,
  onSearchChange,
}: RbacRolesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 py-5 pr-2 pl-5 sm:flex-row sm:items-stretch sm:gap-2">
      <TextField
        label="Search"
        className="flex-1"
        placeholder="Search..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
        endAdornment={
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-control text-grey-700 transition-colors hover:bg-[var(--action-hover)] sm:hidden"
            aria-label="ตัวกรอง"
          >
            <SlidersHorizontal className="size-5" />
          </button>
        }
      />

      {/* Spacer label mirrors the field so the button centers on the input box */}
      <div className="hidden flex-col gap-1.5 sm:flex">
        <span aria-hidden className="select-none text-sm font-medium">
          &nbsp;
        </span>
        <div className="flex flex-1 items-center">
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-[var(--divider)] text-grey-700 transition-colors hover:bg-[var(--action-hover)]"
            aria-label="ตัวกรอง"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
