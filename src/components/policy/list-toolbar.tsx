"use client";

import { Search } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { DatePickerField } from "@/components/form/date-picker-field";

interface Option {
  value: string;
  label: string;
}

interface PolicyListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  categoryOptions: Option[];
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  startDate: Date | null;
  onStartDateChange: (v: Date) => void;
  endDate: Date | null;
  onEndDateChange: (v: Date) => void;
  status: string;
  onStatusChange: (v: string) => void;
  statusOptions: Option[];
}

const ALL = "__all__";

function sixMonthsAgo(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
}

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
  const statusSelectOptions = [{ value: ALL, label: "ทั้งหมด" }, ...statusOptions];
  const earliest = sixMonthsAgo();
  const endMinDate = startDate && startDate > earliest ? startDate : earliest;

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
      <TextField
        label="คำค้นหา"
        placeholder="เช่น เลขที่กรมธรรม์, ชื่อผู้เอาประกัน"
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
      />

      <TextField
        label="ชื่อ-นามสกุล"
        placeholder="เช่น ใจดี"
        value={customerName}
        onChange={onCustomerNameChange}
      />

      <SelectField
        label="ประเภทประกันภัย"
        value={category}
        onChange={onCategoryChange}
        options={categoryOptions}
      />

      <DatePickerField
        label="วันที่เริ่มต้นความคุ้มครอง"
        value={startDate}
        onChange={onStartDateChange}
        minDate={earliest}
      />

      <DatePickerField
        label="วันที่สิ้นสุดความคุ้มครอง"
        value={endDate}
        onChange={onEndDateChange}
        minDate={endMinDate}
      />

      <SelectField
        label="สถานะการชำระเงิน"
        value={status === "all" ? ALL : status}
        onChange={(v) => onStatusChange(v === ALL || v === "" ? "all" : v)}
        options={statusSelectOptions}
        clearable
      />
    </div>
  );
}
