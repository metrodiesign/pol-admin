"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";

interface Option {
  value: string;
  label: string;
}

/** date filter แบบ /dashboard/invoice/list — text + placeholder + ปุ่ม calendar (label บน). */
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
    <div className="flex w-full flex-col gap-1.5 sm:w-[160px] sm:shrink-0">
      <span className="select-none text-sm font-medium text-grey-800">{label}</span>
      <div
        className={cn(
          "flex h-12 items-center rounded-control border bg-transparent pl-3.5 pr-1.5 transition-colors",
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
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-grey-500"
        />
        <button
          type="button"
          aria-label="เลือกวันที่"
          className="grid size-10 shrink-0 place-items-center rounded-full text-grey-600 transition-colors hover:bg-[var(--action-hover)]"
        >
          <CalendarDays className="size-5" />
        </button>
      </div>
    </div>
  );
}

interface PolicyListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  type: string;
  onTypeChange: (v: string) => void;
  typeOptions: Option[];
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
}

const ALL = "__all__";

/** layout เดียวกับ /user/list: TextField search + SelectField + DateField (label บน) + ปุ่มตัวกรอง. */
export function PolicyListToolbar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  typeOptions,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: PolicyListToolbarProps) {
  const typeSelectOptions = [{ value: ALL, label: "ทั้งหมด" }, ...typeOptions];

  return (
    <div className="flex flex-col gap-3 py-5 pr-2 pl-5 sm:flex-row sm:items-stretch sm:gap-2">
      <TextField
        label="ค้นหา"
        className="flex-1"
        placeholder="ค้นหาเลขกรมธรรม์, ลูกค้า..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
        endAdornment={
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-control text-grey-700 transition-colors hover:bg-[var(--action-hover)] sm:hidden"
            aria-label="ตัวกรองเพิ่มเติม"
          >
            <SlidersHorizontal className="size-5" />
          </button>
        }
      />

      <SelectField
        label="ประเภท"
        className="w-full sm:w-[200px]"
        value={type || ALL}
        onChange={(v) => onTypeChange(v === ALL ? "" : v)}
        options={typeSelectOptions}
      />

      <DateInput label="วันที่เริ่มต้น" value={startDate} onChange={onStartDateChange} />

      <DateInput label="วันที่สิ้นสุด" value={endDate} onChange={onEndDateChange} />

      {/* Spacer label mirrors the fields so the button centers on the input box */}
      <div className="hidden flex-col gap-1.5 sm:flex">
        <span aria-hidden className="select-none text-sm font-medium">
          &nbsp;
        </span>
        <div className="flex flex-1 items-center">
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-[var(--divider)] text-grey-700 transition-colors hover:bg-[var(--action-hover)]"
            aria-label="ตัวกรองเพิ่มเติม"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
