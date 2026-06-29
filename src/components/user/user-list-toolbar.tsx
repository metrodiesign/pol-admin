"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { USER_ROLES } from "@/lib/mock/users";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";

const ROLE_OPTIONS = [
  { value: "__all__", label: "ทุกบทบาท" },
  ...USER_ROLES.map((r) => ({ value: r, label: r })),
];

interface UserListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
}

export function UserListToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
}: UserListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 py-5 pr-2 pl-5 sm:flex-row sm:items-stretch sm:gap-2">
      <SelectField
        label="บทบาท"
        className="w-full sm:w-[200px]"
        value={role || "__all__"}
        onChange={(v) => onRoleChange(v === "__all__" ? "" : v)}
        options={ROLE_OPTIONS}
      />

      <TextField
        label="ค้นหา"
        className="flex-1"
        placeholder="ค้นหา..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
        endAdornment={
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-control text-grey-700 transition-colors hover:bg-[var(--action-hover)] sm:hidden"
            aria-label="ตัวกรอง"
          >
            <SlidersHorizontal className="size-5" />
          </button>
        }
      />

      {/* Spacer label mirrors the fields so the button centers on the input box, not the full field */}
      <div className="hidden flex-col gap-1.5 sm:flex">
        <span aria-hidden className="select-none text-sm font-medium">&nbsp;</span>
        <div className="flex flex-1 items-center">
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-[var(--divider)] text-grey-700 transition-colors hover:bg-[var(--action-hover)]"
            aria-label="ตัวกรอง"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
