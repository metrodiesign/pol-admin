"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Eye, Pencil, Trash2, Users } from "lucide-react";
import type { Permission, Role } from "@/types/merchant/user/role";
import { grantedCount, isRoleDeletable } from "@/lib/merchant/role/permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RoleBadge } from "./badge";
import { RoleStatusBadge } from "./status-badge";
import { RolePermissionProgress } from "./permission-progress";

interface BuildColumnsArgs {
  catalog: Permission[];
  onSelect?: (role: Role) => void;
  onRead?: (role: Role) => void;
  onEdit?: (role: Role) => void;
  onDuplicate?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

/** ColumnDef ของตารางบทบาท — รูปแบบเดียวกับ user module (select checkbox + thead ผ่าน DataTable). */
export function buildRoleColumns({
  catalog,
  onSelect,
  onRead,
  onEdit,
  onDuplicate,
  onDelete,
}: BuildColumnsArgs): ColumnDef<Role>[] {
  const total = catalog.length;

  return [
    {
      id: "select",
      enableSorting: false,
      meta: { headClassName: "w-12 pl-1 pr-0 py-2", cellClassName: "w-12 pl-1 pr-0" },
      header: ({ table }) => (
        <Checkbox
          className="justify-end"
          checked={table.getIsAllRowsSelected()}
          indeterminate={
            table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
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
      accessorKey: "name",
      header: "บทบาท",
      enableSorting: true,
      cell: ({ row }) => {
        const role = row.original;
        return (
          <button
            type="button"
            onClick={() => onSelect?.(role)}
            className="inline-flex rounded-control text-left outline-none focus-visible:ring-2 focus-visible:ring-grey-800"
            aria-label={`ดูรายละเอียดบทบาท ${role.name}`}
          >
            <RoleBadge color={role.color} name={role.name} />
          </button>
        );
      },
    },
    {
      accessorKey: "description",
      header: "คำอธิบาย",
      enableSorting: false,
      meta: { cellClassName: "max-w-xs whitespace-normal text-grey-600" },
      cell: ({ getValue }) => (
        <span className="text-sm text-grey-600">{getValue<string>()}</span>
      ),
    },
    {
      id: "permissions",
      header: "สิทธิ์",
      enableSorting: false,
      cell: ({ row }) => (
        <RolePermissionProgress
          value={grantedCount(row.original.permissions, catalog)}
          max={total}
        />
      ),
    },
    {
      accessorKey: "userCount",
      header: "ผู้ใช้",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
          <Users className="size-4 text-grey-500" />
          {row.original.userCount}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "สถานะ",
      enableSorting: false,
      meta: { headClassName: "w-[140px]", cellClassName: "w-[140px]" },
      cell: ({ row }) => <RoleStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { headClassName: "w-56", cellClassName: "w-56", ignoreRowClick: true },
      header: () => null,
      cell: ({ row }) => {
        const role = row.original;
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
                    aria-label={`ดูบทบาท ${role.name}`}
                    onClick={() => onRead?.(role)}
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
                    aria-label={`แก้ไขบทบาท ${role.name}`}
                    onClick={() => onEdit?.(role)}
                  >
                    <Pencil className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>แก้ไข</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                    aria-label={`ทำสำเนาบทบาท ${role.name}`}
                    onClick={() => onDuplicate?.(role)}
                  >
                    <Copy className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ทำสำเนา</TooltipContent>
              </Tooltip>
              {isRoleDeletable(role) ? (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="size-10 cursor-pointer text-error hover:bg-error/8 hover:text-error"
                      aria-label={`ลบบทบาท ${role.name}`}
                      onClick={() => onDelete?.(role)}
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>ลบ</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      disabled
                      className="size-10 text-error hover:bg-error/8 hover:text-error"
                      aria-label={`ลบบทบาท ${role.name} (มีผู้ใช้ผูกอยู่ ลบไม่ได้)`}
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>มีผู้ใช้ผูกอยู่ — ลบบทบาทนี้ไม่ได้</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        );
      },
    },
  ];
}
