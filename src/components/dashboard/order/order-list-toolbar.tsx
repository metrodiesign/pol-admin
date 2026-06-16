"use client";

import { useState } from "react";
import { Search, CalendarDays, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="select-none text-sm font-medium text-grey-800">{label}</span>
      <div
        className={cn(
          "flex h-12 items-center rounded-control border bg-transparent transition-colors pl-3.5 pr-1.5",
          focused
            ? "border-grey-800 ring-1 ring-inset ring-grey-800"
            : "border-[var(--divider)]",
        )}
      >
        <input
          type="text"
          aria-label={label}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-grey-500 outline-none"
        />
        <button
          type="button"
          aria-label="Choose date"
          className="grid size-10 shrink-0 place-items-center rounded-full text-grey-600 transition-colors hover:bg-[var(--action-hover)]"
        >
          <CalendarDays className="size-5" />
        </button>
      </div>
    </div>
  );
}

export function OrderListToolbar({
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: OrderListToolbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="flex flex-col gap-3 py-5 pr-2 pl-5 mmd:flex-row mmd:items-stretch mmd:gap-4">
      <div className="w-full mmd:w-[200px] mmd:shrink-0">
        <DateInput
          label="Start date"
          value={startDate}
          onChange={onStartDateChange}
        />
      </div>

      <div className="w-full mmd:w-[200px] mmd:shrink-0">
        <DateInput
          label="End date"
          value={endDate}
          onChange={onEndDateChange}
        />
      </div>

      {/* Search */}
      <div className="flex flex-1 flex-col gap-1.5">
        <span className="select-none text-sm font-medium text-grey-800">Search</span>
        <div
          className={cn(
            "flex h-12 flex-1 items-center gap-2 rounded-control border bg-transparent transition-colors px-3.5",
            searchFocused
              ? "border-grey-800 ring-1 ring-inset ring-grey-800"
              : "border-[var(--divider)]",
          )}
        >
          <Search className="size-5 shrink-0 text-grey-600" />
          <input
            type="text"
            aria-label="Search customer or order number"
            placeholder="Search customer or order number..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-grey-500 outline-none"
          />
        </div>
      </div>

      {/* Kebab — spacer label mirrors fields so button aligns to input */}
      <div className="hidden flex-col gap-1.5 mmd:flex">
        <span aria-hidden className="select-none text-sm font-medium">&nbsp;</span>
        <div className="flex flex-1 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-grey-600 hover:text-foreground"
            aria-label="More filters"
          >
            <EllipsisVertical className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
