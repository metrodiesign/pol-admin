"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Eye, Pencil, Trash2, Users } from "lucide-react";
import type { Permission, Role } from "@/types/rbac";
import { grantedCount, isRoleDeletable } from "@/lib/rbac/role-permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RbacRoleBadge } from "./rbac-role-badge";
import { RbacRoleStatusBadge } from "./rbac-role-status-badge";
import { RbacPermissionProgress } from "./rbac-permission-progress";

interface BuildColumnsArgs {
  catalog: Permission[];
  onSelect?: (role: Role) => void;
  onRead?: (role: Role) => void;
  onEdit?: (role: Role) => void;
  onDuplicate?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

/** ColumnDef ของตารางบทบาท — รูปแบบเดียวกับ user module (select checkbox + thead ผ่าน DataTable). */
export function buildRbacRoleColumns({
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
      meta: { headClassName: "w-12 pl-1 pr-0", cellClassName: "w-12 pl-1 pr-0" },
      header: ({ table }) => (
        <Checkbox
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
            className="flex flex-col items-start gap-1 rounded-control text-left outline-none focus-visible:ring-2 focus-visible:ring-grey-800"
            aria-label={`ดูรายละเอียดบทบาท ${role.name}`}
          >
            <RbacRoleBadge color={role.color} name={role.name} />
            <span className="font-mono text-xs text-grey-500">{role.code}</span>
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
        <RbacPermissionProgress
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
      cell: ({ row }) => <RbacRoleStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { headClassName: "w-40", cellClassName: "w-40" },
      header: () => null,
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-lg"
              className="text-grey-600 hover:bg-grey-600/8 hover:text-grey-600"
              aria-label={`ดูบทบาท ${role.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onRead?.(role);
              }}
            >
              <Eye className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              className="text-grey-600 hover:bg-grey-600/8 hover:text-grey-600"
              aria-label={`แก้ไขบทบาท ${role.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(role);
              }}
            >
              <Pencil className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              className="text-grey-600 hover:bg-grey-600/8 hover:text-grey-600"
              aria-label={`ทำสำเนาบทบาท ${role.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.(role);
              }}
            >
              <Copy className="size-5" />
            </Button>
            {isRoleDeletable(role) ? (
              <Button
                variant="ghost"
                size="icon-lg"
                className="text-error hover:bg-error/8 hover:text-error"
                aria-label={`ลบบทบาท ${role.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(role);
                }}
              >
                <Trash2 className="size-5" />
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      disabled
                      className="text-error hover:bg-error/8 hover:text-error"
                      aria-label={`ลบบทบาท ${role.name} (มีผู้ใช้ผูกอยู่ ลบไม่ได้)`}
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>มีผู้ใช้ผูกอยู่ — ลบบทบาทนี้ไม่ได้</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];
}
