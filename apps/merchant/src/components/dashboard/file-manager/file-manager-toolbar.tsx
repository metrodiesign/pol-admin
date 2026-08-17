"use client";

import { useState } from "react";
import { Search, ChevronDown, LayoutList, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileManagerToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
}

export function FileManagerToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
}: FileManagerToolbarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-stretch sm:gap-4">
      {/* Search */}
      <div className="flex flex-1 flex-col gap-1.5">
        <span className="select-none text-sm font-medium text-grey-800">Search</span>
        <div
          className={cn(
            "flex h-12 items-center gap-2 rounded-control border bg-transparent px-3.5 transition-colors",
            focused
              ? "border-grey-800 ring-1 ring-inset ring-grey-800"
              : "border-[var(--divider)]",
          )}
        >
          <Search className="size-5 shrink-0 text-grey-500" />
          <input
            type="text"
            aria-label="Search"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-grey-500 outline-none"
          />
        </div>
      </div>

      {/* Select date */}
      <div className="flex flex-col gap-1.5">
        <span className="select-none text-sm font-medium text-grey-800">Date</span>
        <div className="flex flex-1 items-center">
          <button
            type="button"
            className="flex h-12 min-w-[140px] items-center gap-1.5 rounded-control border border-[var(--divider)] px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--action-hover)]"
          >
            Select date
            <ChevronDown className="size-4 text-grey-500" />
          </button>
        </div>
      </div>

      {/* All type */}
      <div className="flex flex-col gap-1.5">
        <span className="select-none text-sm font-medium text-grey-800">Type</span>
        <div className="flex flex-1 items-center">
          <button
            type="button"
            className="flex h-12 min-w-[120px] items-center gap-1.5 rounded-control border border-[var(--divider)] px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--action-hover)]"
          >
            All type
            <ChevronDown className="size-4 text-grey-500" />
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex flex-col gap-1.5">
        <span className="select-none text-sm font-medium text-grey-800">View</span>
        <div className="flex flex-1 items-center">
          <div className="flex h-12 overflow-hidden rounded-control border border-[var(--divider)]">
            <button
              type="button"
              onClick={() => onViewChange("list")}
              aria-label="List view"
              className={cn(
                "flex w-12 items-center justify-center transition-colors",
                view === "list"
                  ? "bg-grey-200 text-foreground"
                  : "text-grey-500 hover:bg-[var(--action-hover)]",
              )}
            >
              <LayoutList className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              aria-label="Grid view"
              className={cn(
                "flex w-12 items-center justify-center transition-colors",
                view === "grid"
                  ? "bg-grey-200 text-foreground"
                  : "text-grey-500 hover:bg-[var(--action-hover)]",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
