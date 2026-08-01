"use client";

import { Search } from "lucide-react";
import { USER_ROLES } from "@/lib/mock/users";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { statusLabel } from "./user-table-columns";

const ROLE_OPTIONS = USER_ROLES.map((r) => ({ value: r, label: r }));

const STATUS_OPTIONS = Object.entries(statusLabel).map(([value, label]) => ({
  value,
  label,
}));

const ROWS_OPTIONS = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

interface UserListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (n: number) => void;
}

export function UserListToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  rowsPerPage,
  onRowsPerPageChange,
}: UserListToolbarProps) {
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
        label="บทบาท"
        value={role}
        onChange={onRoleChange}
        options={ROLE_OPTIONS}
        placeholder="ทุกบทบาท"
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
