"use client";

import { Search } from "lucide-react";
import { PERSON_TYPE_LABEL, type PersonType } from "@/types/merchant-user";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { statusLabel } from "./producer-table-columns";

const PERSON_TYPES: PersonType[] = ["Individual", "Juristic"];

const PERSON_TYPE_OPTIONS = PERSON_TYPES.map((pt) => ({
  value: pt,
  label: PERSON_TYPE_LABEL[pt],
}));

const STATUS_OPTIONS = Object.entries(statusLabel).map(([value, label]) => ({
  value,
  label,
}));

const ROWS_OPTIONS = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

interface ProducerListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  personType: string;
  onPersonTypeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (n: number) => void;
}

export function ProducerListToolbar({
  search,
  onSearchChange,
  personType,
  onPersonTypeChange,
  status,
  onStatusChange,
  rowsPerPage,
  onRowsPerPageChange,
}: ProducerListToolbarProps) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
      <TextField
        label="ค้นหา"
        placeholder="ค้นหาชื่อหรืออีเมล..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
      />

      <SelectField
        label="ประเภท"
        value={personType}
        onChange={onPersonTypeChange}
        options={PERSON_TYPE_OPTIONS}
        placeholder="ทุกประเภท"
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

      <SelectField
        label="จำนวนต่อหน้า"
        value={String(rowsPerPage)}
        onChange={(v) => onRowsPerPageChange(Number(v))}
        options={ROWS_OPTIONS}
      />
    </div>
  );
}
