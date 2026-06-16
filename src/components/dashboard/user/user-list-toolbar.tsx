"use client";

import { Search, EllipsisVertical } from "lucide-react";
import { USER_ROLES } from "@/lib/mock/users";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { Button } from "@/components/ui/button";

const ROLE_OPTIONS = [
  { value: "__all__", label: "All roles" },
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
    <div className="flex flex-col gap-3 py-5 pr-2 pl-5 sm:flex-row sm:items-stretch sm:gap-4">
      <SelectField
        label="Role"
        className="w-full sm:w-[200px]"
        value={role || "__all__"}
        onChange={(v) => onRoleChange(v === "__all__" ? "" : v)}
        options={ROLE_OPTIONS}
      />

      <TextField
        label="Search"
        className="flex-1"
        placeholder="Search..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
        endAdornment={
          <Button variant="ghost" size="icon" className="text-grey-600 sm:hidden">
            <EllipsisVertical className="size-5" />
          </Button>
        }
      />

      {/* Spacer label mirrors the fields so the button centers on the input box, not the full field */}
      <div className="hidden flex-col gap-1.5 sm:flex">
        <span aria-hidden className="select-none text-sm font-medium">&nbsp;</span>
        <div className="flex flex-1 items-center">
          <Button variant="ghost" size="icon" className="text-grey-600 shrink-0">
            <EllipsisVertical className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
