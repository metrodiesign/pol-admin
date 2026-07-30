"use client";

import { useId, useState } from "react";
import { Search, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHANNEL_LABEL, ORDER_STATUS_LABEL } from "@/lib/order";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";

interface Option {
  value: string;
  label: string;
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
  const id = useId();
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label id={id} className="text-sm font-medium text-grey-800">
        {label}
      </label>
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
          aria-labelledby={id}
          placeholder="YYYY-MM-DD"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-grey-500"
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

interface OrderListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  channel: string;
  onChannelChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (n: number) => void;
}

const CHANNEL_OPTIONS: Option[] = Object.entries(CHANNEL_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_OPTIONS: Option[] = Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const ROWS_OPTIONS: Option[] = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

export function OrderListToolbar({
  search,
  onSearchChange,
  channel,
  onChannelChange,
  status,
  onStatusChange,
  rowsPerPage,
  onRowsPerPageChange,
}: OrderListToolbarProps) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Row 1 */}
      <TextField
        label="ค้นหา"
        placeholder="ค้นหารหัสธุรกรรม, ลูกค้า, อีเมล..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
      />

      <SelectField
        label="ช่องทางชำระเงิน"
        value={channel}
        onChange={onChannelChange}
        options={CHANNEL_OPTIONS}
        placeholder="ทั้งหมด"
        clearable
      />

      <SelectField
        label="สถานะ"
        value={status}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        placeholder="ทั้งหมด"
        clearable
      />

      {/* Row 2 */}
      {/* ponytail: visual only, ยังไม่ wire */}
      <DateInput label="วันที่" value="24 พ.ค. 2569" onChange={() => {}} />

      <SelectField
        label="จำนวนต่อหน้า"
        value={String(rowsPerPage)}
        onChange={(v) => onRowsPerPageChange(Number(v))}
        options={ROWS_OPTIONS}
      />

    </div>
  );
}
