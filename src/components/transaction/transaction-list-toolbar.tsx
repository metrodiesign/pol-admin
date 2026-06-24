"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Download, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/transaction";
import type { Transaction } from "@/types/transaction";

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
    <div className="flex w-full flex-col gap-1.5">
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
          placeholder="YYYY-MM-DD"
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

interface TransactionListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  source: string;
  onSourceChange: (v: string) => void;
  sourceOptions: Option[];
  psp: string;
  onPspChange: (v: string) => void;
  rows: Transaction[];
}

const ALL = "__all__";

const PSP_OPTIONS: Option[] = [
  { value: ALL, label: "ทั้งหมด" },
  { value: "omise", label: "Omise" },
  { value: "2c2p", label: "2C2P" },
];

/** search + filters bar แถวเดียว (wrap บนจอเล็ก) สำหรับหน้ารายการธุรกรรม. */
export function TransactionListToolbar({
  search,
  onSearchChange,
  source,
  onSourceChange,
  sourceOptions,
  psp,
  onPspChange,
  rows,
}: TransactionListToolbarProps) {
  const sourceSelectOptions = [{ value: ALL, label: "ทั้งหมด" }, ...sourceOptions];

  return (
    <div className="flex flex-col gap-3 px-5 py-5 lg:flex-row lg:items-end">
      <TextField
        label=""
        className="flex-1"
        placeholder="ค้นหารหัสธุรกรรม, ลูกค้า, อีเมล..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
      />

      <SelectField
        label="ที่มา"
        className="w-full lg:w-[200px]"
        value={source || ALL}
        onChange={(v) => onSourceChange(v === ALL ? "" : v)}
        options={sourceSelectOptions}
      />

      <SelectField
        label="PSP"
        className="w-full lg:w-[180px]"
        value={psp || ALL}
        onChange={(v) => onPspChange(v === ALL ? "" : v)}
        options={PSP_OPTIONS}
      />

      {/* ponytail: visual only, ยังไม่ wire */}
      <DateInput
        label="วันที่"
        value="24 พ.ค. 2569"
        onChange={() => {}}
      />

      <div className="lg:flex-1" />

      {/* ponytail: visual only, ยังไม่ wire */}
      <Button variant="outline" size="lg">
        <SlidersHorizontal className="size-4" />
        ตัวกรองเพิ่มเติม
      </Button>

      <Button size="lg" onClick={() => downloadCsv("transactions.csv", rows)}>
        <Download className="size-4" />
        ส่งออก CSV
      </Button>
    </div>
  );
}
