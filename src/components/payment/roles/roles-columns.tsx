"use client";

import "@/types/table-meta";
import type { ColumnDef } from "@tanstack/react-table";
import type { Role } from "@/types/role";
import { PERMISSIONS } from "@/lib/mock/roles";
import { RoleBadge, PortalBadge } from "./role-badge";
import { Settings, Copy, Trash2, Users } from "lucide-react";

interface RolesColumnDeps {
  rolePerms: Record<string, string[]>;
  usageByRole: Record<string, number>;
}

interface RolesColumnHandlers {
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function makeRolesColumns(
  deps: RolesColumnDeps,
  handlers: RolesColumnHandlers,
): ColumnDef<Role>[] {
  const { rolePerms, usageByRole } = deps;
  const { onEdit, onDuplicate, onDelete } = handlers;

  return [
    {
      accessorKey: "name",
      enableSorting: true,
      header: "Role",
      sortingFn: (a, b) =>
        a.original.name.localeCompare(b.original.name, "th"),
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <RoleBadge color={r.color} name={r.name} />
            <code className="mt-1 block font-mono text-xs text-grey-500">
              {r.id}
            </code>
          </div>
        );
      },
    },
    {
      accessorKey: "portal",
      enableSorting: true,
      header: "Portal",
      sortingFn: (a, b) =>
        a.original.portal.localeCompare(b.original.portal, "en"),
      cell: ({ row }) => <PortalBadge portal={row.original.portal} />,
    },
    {
      accessorKey: "desc",
      enableSorting: false,
      header: "คำอธิบาย",
      cell: ({ row }) => (
        <span className="text-sm text-grey-600">
          {row.original.desc || <span className="text-grey-400">—</span>}
        </span>
      ),
    },
    {
      id: "perms",
      enableSorting: true,
      header: "Permissions",
      accessorFn: (r) => (rolePerms[r.id] ?? []).length,
      cell: ({ row }) => {
        const permCount = (rolePerms[row.original.id] ?? []).length;
        const pct = Math.round((permCount / PERMISSIONS.length) * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-[72px] overflow-hidden rounded-full bg-grey-200">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="tabular-nums text-sm font-semibold">
              {permCount}
              <span className="text-grey-500">/{PERMISSIONS.length}</span>
            </span>
          </div>
        );
      },
    },
    {
      id: "users",
      enableSorting: true,
      header: "ผู้ใช้",
      accessorFn: (r) => usageByRole[r.id] ?? 0,
      cell: ({ row }) => {
        const used = usageByRole[row.original.id] ?? 0;
        return used > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Users className="size-3.5 text-grey-500" />
            <span className="tabular-nums">{used}</span>
          </span>
        ) : (
          <span className="text-sm text-grey-400">ยังไม่มี</span>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { headClassName: "w-20", cellClassName: "w-20" },
      header: () => null,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <span onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end gap-1">
              <button
                title="แก้ไข"
                onClick={() => onEdit(r)}
                className="grid h-7 w-7 place-items-center rounded-full text-grey-500 transition-colors hover:bg-grey-200"
              >
                <Settings className="size-3.5" />
              </button>
              <button
                title="ทำสำเนา"
                onClick={() => onDuplicate(r)}
                className="grid h-7 w-7 place-items-center rounded-full text-grey-500 transition-colors hover:bg-grey-200"
              >
                <Copy className="size-3.5" />
              </button>
              <button
                title="ลบ"
                onClick={() => onDelete(r)}
                className="grid h-7 w-7 place-items-center rounded-full text-grey-500 transition-colors hover:bg-error/10 hover:text-error-dark"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </span>
        );
      },
    },
  ];
}
