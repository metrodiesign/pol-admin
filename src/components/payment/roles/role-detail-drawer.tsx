"use client";

import { X, Settings, Copy, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/role";
import { PERMISSIONS } from "@/lib/mock/roles";
import { RoleBadge, PortalBadge } from "./role-badge";

const COLOR_ICON_BG: Record<string, string> = {
  danger:  "bg-error/12 text-error-dark",
  warning: "bg-warning/12 text-warning-dark",
  info:    "bg-primary/10 text-primary",
  neutral: "bg-grey-500/10 text-grey-600",
  success: "bg-success/12 text-success-dark",
};

interface UserSummary {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface RoleDetailDrawerProps {
  role: Role | null;
  rolePerms: Record<string, string[]>;
  users: UserSummary[];
  open: boolean;
  onClose: () => void;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (role: Role) => void;
  onTogglePerm: (roleId: string, permId: string) => void;
}

export function RoleDetailDrawer({
  role,
  rolePerms,
  users,
  open,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onTogglePerm,
}: RoleDetailDrawerProps) {
  if (!role) return null;
  const perms = new Set(rolePerms[role.id] ?? []);
  const groups = [...new Set(PERMISSIONS.map((p) => p.group))];

  const statusLabel: Record<string, { label: string; cls: string }> = {
    active:   { label: "ใช้งานอยู่",  cls: "bg-success/12 text-success-dark" },
    pending:  { label: "รออนุมัติ",   cls: "bg-warning/12 text-warning-dark" },
    disabled: { label: "ปิดใช้งาน",   cls: "bg-grey-500/10 text-grey-600" },
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[620px]"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center gap-3 border-b border-[rgba(145,158,171,0.12)] px-5 py-4">
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-grey-600 transition-colors hover:bg-grey-200"
            aria-label="ปิด"
          >
            <X className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-xs font-semibold uppercase tracking-widest text-grey-500">
              รายละเอียด Role
            </SheetTitle>
            <p className="mt-0.5 font-mono text-xs font-bold text-foreground">
              {role.id}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => onDuplicate(role)}
          >
            <Copy className="size-3.5" />
            ทำสำเนา
          </Button>
          <Button
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => onEdit(role)}
          >
            <Settings className="size-3.5" />
            แก้ไข
          </Button>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-5">
            {/* Hero */}
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  "grid h-14 w-14 shrink-0 place-items-center rounded-[14px]",
                  COLOR_ICON_BG[role.color] ?? COLOR_ICON_BG.neutral,
                )}
              >
                <Settings className="size-7" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold">{role.name}</p>
                <p className="mt-0.5 text-sm text-grey-600">
                  {role.desc || (
                    <span className="text-grey-400">— ไม่มีคำอธิบาย —</span>
                  )}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <PortalBadge portal={role.portal} />
                  <RoleBadge color={role.color} name={role.name} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-[rgba(145,158,171,0.24)] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-grey-500">
                  Permissions
                </p>
                <p className="mt-0.5 text-2xl font-bold tabular-nums">
                  {perms.size}
                  <span className="text-base text-grey-500">
                    /{PERMISSIONS.length}
                  </span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-grey-200">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.round((perms.size / PERMISSIONS.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-[rgba(145,158,171,0.24)] p-3.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-grey-500">
                  ผู้ใช้ที่ผูก
                </p>
                <p className="mt-0.5 text-2xl font-bold tabular-nums">
                  {users.length}
                </p>
                <p className="mt-2 text-sm text-grey-500">
                  {users.length === 0
                    ? "role นี้ยังไม่ถูกใช้"
                    : `${users.length} บัญชี`}
                </p>
              </div>
            </div>

            {/* Permissions list */}
            <div>
              <div className="mb-2 flex items-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-grey-500">
                  สิทธิ์ที่ได้รับ
                </p>
                <span className="ml-auto text-xs text-grey-500">
                  กดเพื่อเปิด/ปิดสิทธิ์
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.24)]">
                {groups.map((g, gi) => {
                  const groupPerms = PERMISSIONS.filter((p) => p.group === g);
                  const onCount = groupPerms.filter((p) => perms.has(p.id)).length;
                  return (
                    <div
                      key={g}
                      className={cn(gi > 0 && "border-t border-[rgba(145,158,171,0.12)]")}
                    >
                      <div className="flex items-center gap-2 bg-grey-100 px-3.5 py-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-grey-600">
                          {g}
                        </span>
                        <span className="tabular-nums text-xs text-grey-500">
                          {onCount}/{groupPerms.length}
                        </span>
                      </div>
                      {groupPerms.map((p) => {
                        const on = perms.has(p.id);
                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "flex items-center gap-3 border-t border-[rgba(145,158,171,0.12)] px-3.5 py-2.5",
                              on && "bg-primary/5",
                            )}
                          >
                            <span
                              className={cn(
                                "inline-grid h-6 w-6 shrink-0 place-items-center rounded-full",
                                on
                                  ? "bg-success/12 text-success-dark"
                                  : "bg-grey-200 text-grey-500",
                              )}
                            >
                              {on ? (
                                <CheckCircle className="size-3.5" />
                              ) : (
                                <XCircle className="size-3.5" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{p.label}</p>
                              <code className="text-xs text-grey-500">
                                {p.id}
                              </code>
                            </div>
                            <button
                              onClick={() => onTogglePerm(role.id, p.id)}
                              className={cn(
                                "shrink-0 rounded-md border px-2.5 py-1 text-sm font-semibold transition-colors",
                                on
                                  ? "border-[rgba(145,158,171,0.24)] text-grey-600 hover:bg-grey-100"
                                  : "border-primary/20 text-primary hover:bg-primary/10",
                              )}
                            >
                              {on ? "ปลด" : "มอบ"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Users */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-500">
                ผู้ใช้ที่ผูก Role นี้ ({users.length})
              </p>
              {users.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[rgba(145,158,171,0.24)] p-5 text-center">
                  <p className="text-sm text-grey-500">
                    Role นี้ยังไม่ถูกผูกกับผู้ใช้คนใด
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.24)]">
                  {users.map((u, i) => {
                    const cfg = statusLabel[u.status] ?? {
                      label: u.status,
                      cls: "bg-grey-500/10 text-grey-600",
                    };
                    const initials = u.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <div
                        key={u.id}
                        className={cn(
                          "flex items-center gap-3 px-3.5 py-2.5",
                          i > 0 && "border-t border-[rgba(145,158,171,0.12)]",
                        )}
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-sm font-bold text-white">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {u.name}
                          </p>
                          <p className="truncate text-xs text-grey-500">
                            {u.email}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold",
                            cfg.cls,
                          )}
                        >
                          <span className="size-1.5 shrink-0 rounded-full bg-current opacity-80" />
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-[rgba(145,158,171,0.12)] px-5 py-4">
          <Button
            variant="ghost"
            className="gap-1.5 text-error-dark hover:bg-error/10 hover:text-error-dark"
            onClick={() => onDelete(role)}
          >
            <Trash2 className="size-3.5" />
            ลบ Role
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose}>
            ปิด
          </Button>
          <Button className="gap-1.5" onClick={() => onEdit(role)}>
            <Settings className="size-3.5" strokeWidth={2.5} />
            แก้ไข Role
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
