"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface TableSelectedActionProps {
  numSelected: number;
  rowCount: number;
  onSelectAll: (checked: boolean) => void;
  action?: ReactNode;
  /** Left padding for the leading checkbox — match the table's select-column padding. */
  leadingClassName?: string;
}

/**
 * Selection toolbar overlay — มาตามต้นฉบับ minimals: ลอยทับ head เมื่อมี row
 * ถูกเลือก. bg = primary.lighter (เขียวภายใน .theme-minimals ผ่าน cascade).
 */
export function TableSelectedAction({
  numSelected,
  rowCount,
  onSelectAll,
  action,
  leadingClassName = "pl-2",
}: TableSelectedActionProps) {
  if (numSelected === 0) return null;

  return (
    <div
      className={cn(
        "absolute left-0 top-0 z-[9] flex w-full items-center bg-grey-200 pr-4",
        leadingClassName,
      )}
      style={{ height: 58 }}
    >
      <Checkbox
        checked={rowCount > 0 && numSelected === rowCount}
        indeterminate={numSelected > 0 && numSelected < rowCount}
        onChange={onSelectAll}
        aria-label="Select all"
      />
      <span className="ml-2 text-sm font-semibold text-foreground">
        {numSelected} selected
      </span>
      {action ? <div className="ml-4 flex items-center">{action}</div> : null}
    </div>
  );
}
