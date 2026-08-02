"use client";

import SimpleBar from "simplebar-react";
import { Check, Copy, Pencil, Trash2, X } from "lucide-react";
import type { Permission, ResourceGroup, Role } from "@/types/role";
import {
  grantedCount,
  groupGranted,
  groupedCatalog,
  isRoleDeletable,
} from "@/lib/role/role-permissions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RoleBadge } from "./role-badge";
import { RoleStatusBadge } from "./role-status-badge";

interface RoleDetailSheetProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: Permission[];
  groups: ResourceGroup[];
  onEdit?: (role: Role) => void;
  onDuplicate?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RoleDetailSheet({
  role,
  open,
  onOpenChange,
  catalog,
  groups,
  onEdit,
  onDuplicate,
  onDelete,
}: RoleDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 p-0 sm:max-w-md"
      >
        {role && (
          <RoleDetailBody
            role={role}
            catalog={catalog}
            groups={groups}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function RoleDetailBody({
  role,
  catalog,
  groups,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  role: Role;
  catalog: Permission[];
  groups: ResourceGroup[];
  onEdit?: (role: Role) => void;
  onDuplicate?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}) {
  const granted = grantedCount(role.permissions, catalog);
  const total = catalog.length;
  const held = new Set(role.permissions);
  // เฉพาะกลุ่มที่บทบาทได้รับสิทธิ์อย่างน้อย 1 รายการ — แสดง "สิทธิ์ที่ได้รับ"
  const grouped = groupedCatalog(catalog, groups)
    .map((entry) => ({
      group: entry.group,
      permissions: entry.permissions.filter((p) => held.has(p.key)),
      ...groupGranted(role, entry.group.key, catalog),
    }))
    .filter((entry) => entry.permissions.length > 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header (custom: badge + รหัสบทบาท + close, then สำเนา/แก้ไข grid) */}
      <div className="flex flex-col gap-4 border-b border-[var(--divider)] p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <SheetTitle className="sr-only">
              รายละเอียดบทบาท {role.name}
            </SheetTitle>
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge color={role.color} name={role.name} />
              <RoleStatusBadge status={role.status} />
            </div>
            <span className="font-mono text-xs text-grey-500">
              รหัสบทบาท: {role.code}
            </span>
          </div>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="ปิด"
                className="shrink-0 text-grey-600"
              />
            }
          >
            <X className="size-5" />
          </SheetClose>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-9"
            onClick={() => onDuplicate?.(role)}
          >
            <Copy className="size-4" />
            สำเนา
          </Button>
          <Button
            className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onEdit?.(role)}
          >
            <Pencil className="size-4" />
            แก้ไข
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <SimpleBar autoHide={false} style={{ height: "100%" }}>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-4 px-4">
            <p className="text-sm text-grey-600">{role.description}</p>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-control border border-[var(--divider)] p-3">
                <p className="text-xs text-grey-500">สิทธิ์ที่ได้รับ</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {granted}/{total}
                </p>
              </div>
              <div className="rounded-control border border-[var(--divider)] p-3">
                <p className="text-xs text-grey-500">ผู้ใช้ที่ผูก</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {role.userCount}
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-foreground">
              สิทธิ์ที่ได้รับ
            </p>
          </div>

          {/* Permissions grouped by resource — group band + flat rows */}
          <div className="flex flex-col">
            {grouped.map((entry) => (
              <div key={entry.group.key}>
                <div className="flex items-center justify-between bg-grey-100 px-4 py-2.5">
                  <span className="text-sm font-semibold text-grey-700">
                    {entry.group.label}
                  </span>
                  <span className="text-sm tabular-nums text-grey-500">
                    {entry.granted}/{entry.total}
                  </span>
                </div>
                <ul className="flex flex-col">
                  {entry.permissions.map((p) => (
                    <li
                      key={p.key}
                      className="flex items-center justify-between gap-3 border-b border-[var(--divider)] px-4 py-3"
                    >
                      <span className="flex items-center gap-3 text-sm text-foreground">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/16">
                          <Check className="size-3.5 text-success" />
                        </span>
                        {p.label}
                      </span>
                      <span className="font-mono text-xs text-grey-500">
                        {p.key}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        </SimpleBar>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-[var(--divider)] p-4">
        {isRoleDeletable(role) ? (
          <Button variant="destructive" onClick={() => onDelete?.(role)}>
            <Trash2 className="size-4" />
            ลบบทบาท
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<span className="inline-flex" />}>
                <Button variant="destructive" disabled>
                  <Trash2 className="size-4" />
                  ลบบทบาท
                </Button>
              </TooltipTrigger>
              <TooltipContent>มีผู้ใช้ผูกอยู่ — ลบบทบาทนี้ไม่ได้</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <SheetClose
          render={
            <button
              type="button"
              className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
            />
          }
        >
          ปิด
        </SheetClose>
      </div>
    </div>
  );
}
