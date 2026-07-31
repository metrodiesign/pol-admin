"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CHANNEL_LABEL, LIST_STATUS_LABEL } from "@/lib/transaction";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { DateRangeField } from "@/components/form/date-range-field";
import type { DateRange } from "@/lib/date-range";

interface Option {
  value: string;
  label: string;
}

interface TransactionListToolbarProps {
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

const STATUS_OPTIONS: Option[] = Object.entries(LIST_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const ROWS_OPTIONS: Option[] = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

export function TransactionListToolbar({
  search,
  onSearchChange,
  channel,
  onChannelChange,
  status,
  onStatusChange,
  rowsPerPage,
  onRowsPerPageChange,
}: TransactionListToolbarProps) {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

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
      {/* ponytail: UI-only local state, ยังไม่ wire เข้า data จริงตาม REQ-6.4 */}
      <DateRangeField label="วันที่" value={dateRange} onChange={setDateRange} />

      <SelectField
        label="จำนวนต่อหน้า"
        value={String(rowsPerPage)}
        onChange={(v) => onRowsPerPageChange(Number(v))}
        options={ROWS_OPTIONS}
      />

    </div>
  );
}
