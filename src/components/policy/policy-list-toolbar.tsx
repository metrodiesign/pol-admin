"use client";

import { useState } from "react";
import { Search, CalendarDays } from "lucide-react";
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
    <div className="flex w-full flex-col gap-1.5">
      <span className="select-none text-sm font-medium text-grey-800">{label}</span>
      <div
        className={cn(
          "flex h-12 items-center rounded-control border bg-transparent pl-3.5 pr-1.5 transition-colors",
          focused
            ? "border-primary ring-1 ring-inset ring-primary"
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

interface PolicyListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  categoryOptions: Option[];
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  statusOptions: Option[];
}

const ALL = "__all__";

/** ตัวกรอง 6 ช่อง grid 3 คอลัมน์ ตามแบบหน้าค้นหากรมธรรม์ (label บนทุกช่อง). */
export function PolicyListToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categoryOptions,
  customerName,
  onCustomerNameChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  status,
  onStatusChange,
  statusOptions,
}: PolicyListToolbarProps) {
  const categorySelectOptions = [{ value: ALL, label: "ทั้งหมด" }, ...categoryOptions];
  const statusSelectOptions = [{ value: ALL, label: "ทั้งหมด" }, ...statusOptions];

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
      <TextField
        label="คำค้นหา"
        placeholder="เช่น เลขที่กรมธรรม์, ชื่อผู้เอาประกัน"
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
      />

      <SelectField
        label="ประเภทประกันภัย"
        placeholder="มอเตอร์ / ไม่ใช่มอเตอร์"
        value={category || ALL}
        onChange={(v) => onCategoryChange(v === ALL ? "" : v)}
        options={categorySelectOptions}
      />

      <TextField
        label="ชื่อ-นามสกุล"
        placeholder="เช่น ใจดี"
        value={customerName}
        onChange={onCustomerNameChange}
      />

      <DateInput
        label="วันที่เริ่มต้นความคุ้มครอง"
        value={startDate}
        onChange={onStartDateChange}
      />

      <DateInput
        label="วันที่สิ้นสุดความคุ้มครอง"
        value={endDate}
        onChange={onEndDateChange}
      />

      <SelectField
        label="สถานะการชำระเงิน"
        value={status === "all" ? ALL : status}
        onChange={(v) => onStatusChange(v === ALL ? "all" : v)}
        options={statusSelectOptions}
      />
    </div>
  );
}
