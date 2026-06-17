"use client";

import { Search, EllipsisVertical } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";

interface RbacRolesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function RbacRolesToolbar({
  search,
  onSearchChange,
}: RbacRolesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 py-5 pr-2 pl-5 sm:flex-row sm:items-stretch sm:gap-4">
      <TextField
        label="Search"
        className="flex-1"
        placeholder="Search..."
        value={search}
        onChange={onSearchChange}
        startAdornment={<Search className="size-5 text-grey-500" />}
        endAdornment={
          <Button
            variant="ghost"
            size="icon"
            className="text-grey-600 sm:hidden"
            aria-label="ตัวเลือกเพิ่มเติม"
          >
            <EllipsisVertical className="size-5" />
          </Button>
        }
      />

      {/* Spacer label mirrors the field so the button centers on the input box */}
      <div className="hidden flex-col gap-1.5 sm:flex">
        <span aria-hidden className="select-none text-sm font-medium">
          &nbsp;
        </span>
        <div className="flex flex-1 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-grey-600"
            aria-label="ตัวเลือกเพิ่มเติม"
          >
            <EllipsisVertical className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
