"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OrgUnitStatusBadge } from "./status-badge";

/** shape ขั้นต่ำที่คอลัมน์ต้องการ — structural typing (REQ-7.3), ไม่ import type เฉพาะ entity ใด */
interface OrgUnitLike {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface BuildColumnsArgs<T> {
  /** label ไทยของ entity (เช่น "สำนักงาน") ใช้ประกอบ aria-label */
  label: string;
  onSelect?: (unit: T) => void;
  onRead?: (unit: T) => void;
  onEdit?: (unit: T) => void;
  onDeactivate?: (unit: T) => void;
}

/** ColumnDef ของตาราง org unit — shared ทุก module ผ่าน generic (REQ-7.3), รูปแบบเดียวกับ role module. */
export function buildOrgUnitColumns<T extends OrgUnitLike>({
  label,
  onSelect,
  onRead,
  onEdit,
  onDeactivate,
}: BuildColumnsArgs<T>): ColumnDef<T>[] {
  return [
    {
      id: "select",
      enableSorting: false,
      meta: { headClassName: "w-12 pl-1 pr-0 py-2", cellClassName: "w-12 pl-1 pr-0" },
      header: ({ table }) => (
        <Checkbox
          className="justify-end"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onChange={(c) => table.toggleAllRowsSelected(c)}
          aria-label="เลือกทั้งหมด"
        />
      ),
      cell: ({ row }) => (
        // หยุด bubble ไม่ให้คลิก checkbox ไปเปิด drawer (onRowClick)
        <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            className="justify-end"
            checked={row.getIsSelected()}
            onChange={(c) => row.toggleSelected(c)}
            aria-label={`เลือก ${row.original.name}`}
          />
        </span>
      ),
    },
    {
      accessorKey: "code",
      header: "รหัส",
      enableSorting: true,
      meta: { headClassName: "w-[180px]", cellClassName: "w-[180px]" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-grey-600">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "ชื่อ",
      enableSorting: true,
      // เรียงตามพจนานุกรมไทย — sort default ของ TanStack เทียบ code point แล้วสระหน้า (เ แ โ ใ ไ) เรียงผิด
      sortingFn: (a, b, id) =>
        String(a.getValue(id)).localeCompare(String(b.getValue(id)), "th"),
      cell: ({ row }) => {
        const unit = row.original;
        return (
          <button
            type="button"
            onClick={() => onSelect?.(unit)}
            className="rounded-control text-left text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-grey-800"
            aria-label={`ดูรายละเอียด${label} ${unit.name}`}
          >
            {unit.name}
          </button>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "สถานะ",
      enableSorting: false,
      meta: { headClassName: "w-[140px]", cellClassName: "w-[140px]" },
      cell: ({ row }) => <OrgUnitStatusBadge isActive={row.original.isActive} />,
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { headClassName: "w-44", cellClassName: "w-44", ignoreRowClick: true },
      header: () => null,
      cell: ({ row }) => {
        const unit = row.original;
        return (
          // คลิกที่ใดก็ได้ในคอลัมน์ action = ไม่เปิด drawer (กัน bubble ไป onRowClick)
          <TooltipProvider>
            <div
              className="flex items-center justify-end gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                    aria-label={`ดู${label} ${unit.name}`}
                    onClick={() => onRead?.(unit)}
                  >
                    <Eye className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ดูรายละเอียด</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                    aria-label={`แก้ไข${label} ${unit.name}`}
                    onClick={() => onEdit?.(unit)}
                  >
                    <Pencil className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>แก้ไข</TooltipContent>
              </Tooltip>
              {/* แถว inactive ไม่มีปุ่มปิดใช้งาน (REQ-2.11) — เปิดกลับทำผ่านหน้าแก้ไข */}
              {unit.isActive && (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="size-10 cursor-pointer text-error hover:bg-error/8 hover:text-error"
                      aria-label={`ปิดใช้งาน${label} ${unit.name}`}
                      onClick={() => onDeactivate?.(unit)}
                    >
                      <Ban className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>ปิดใช้งาน</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        );
      },
    },
  ];
}
