"use client";

import { Search } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { STATUS_OPTIONS } from "./role-status-badge";

interface RolesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function RolesToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: RolesToolbarProps) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
      <TextField
        label="ค้นหา"
        placeholder="ค้นหาชื่อหรือรหัสบทบาท..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
      />

      <SelectField
        label="สถานะ"
        value={status}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        placeholder="ทั้งหมด"
        clearable
      />
    </div>
  );
}
