"use client";

import "@/types/table-meta";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { CheckCircle, XCircle, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { User, UserStatus, UserPortal } from "@/types/user";
import type { Role } from "@/types/role";

/* ─── IDP badge ─── */
const IDP_META: Record<string, { name: string; bg: string; letter: string }> = {
  azuread: { name: "Azure AD", bg: "#0078d4", letter: "A" },
  google:  { name: "Google",   bg: "#ea4335", letter: "G" },
  line:    { name: "LINE",     bg: "#06c755", letter: "L" },
};

function IdpBadge({ provider }: { provider: string }) {
  const meta = IDP_META[provider] ?? { name: provider, bg: "#666", letter: "?" };
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-grey-500">
      <span
        className="grid size-4 shrink-0 place-items-center rounded text-xs font-bold text-white"
        style={{ background: meta.bg }}
      >
        {meta.letter}
      </span>
      {meta.name}
    </span>
  );
}

/* ─── Role badge ─── */
const ROLE_COLOR_CLASS: Record<string, string> = {
  danger:  "bg-error/10 text-error-dark",
  warning: "bg-warning/12 text-warning-dark",
  info:    "bg-primary/10 text-primary",
  success: "bg-success/12 text-success-dark",
  neutral: "bg-grey-500/10 text-grey-600",
  primary: "bg-primary/10 text-primary",
};

interface RoleBadgeProps {
  roleId: string;
  roles: Role[];
}

function RoleBadge({ roleId, roles }: RoleBadgeProps) {
  const r = roles.find((x) => x.id === roleId);
  if (!r) return null;
  const cls = ROLE_COLOR_CLASS[r.color] ?? ROLE_COLOR_CLASS["neutral"]!;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        cls,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-80" />
      {r.name}
    </span>
  );
}

/* ─── Status badge ─── */
const STATUS_CONFIG: Record<UserStatus, { label: string; cls: string }> = {
  active:   { label: "ใช้งานอยู่",  cls: "bg-success/12 text-success-dark" },
  pending:  { label: "รออนุมัติ",  cls: "bg-warning/12 text-warning-dark" },
  disabled: { label: "ปิดใช้งาน",  cls: "bg-grey-500/10 text-grey-600" },
  banned:   { label: "ถูกระงับ",    cls: "bg-error/10 text-error-dark" },
  rejected: { label: "ปฏิเสธแล้ว", cls: "bg-grey-500/10 text-grey-600" },
};

/* ─── Avatar gradient ─── */
function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => {
      if (p.length === 0) return "";
      const ch = p[0];
      return ch !== undefined ? ch : "";
    })
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="grid size-[34px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-sm font-bold text-white">
      {initials}
    </div>
  );
}

/* ─── Portal badge ─── */
function PortalBadge({ portal }: { portal: UserPortal }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      {portal === "admin" ? "Admin Portal" : "Merchant Portal"}
    </span>
  );
}

/* ─── Factory deps / handlers ─── */
export interface UserColumnDeps {
  roles: Role[];
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
  onToggleDisable: (user: User) => void;
  onOpenDrawer: (user: User) => void;
}

export function makeUserColumns({
  roles,
  onApprove,
  onReject,
  onToggleDisable,
  onOpenDrawer,
}: UserColumnDeps): ColumnDef<User>[] {
  return [
    /* ── select ── */
    {
      id: "select",
      enableSorting: false,
      meta: { headClassName: "w-12 pl-1 pr-0", cellClassName: "w-12 pl-1 pr-0" },
      header: ({ table }) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
            aria-label="เลือกทั้งหมด"
          />
        </span>
      ),
      cell: ({ row }: { row: Row<User> }) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(checked) => row.toggleSelected(checked)}
            aria-label={`เลือก ${row.original.name}`}
          />
        </span>
      ),
    },

    /* ── ผู้ใช้งาน ── */
    {
      accessorKey: "name",
      enableSorting: true,
      sortingFn: (a, b) =>
        a.original.name.localeCompare(b.original.name, "th"),
      header: "ผู้ใช้งาน",
      cell: ({ row }: { row: Row<User> }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <UserAvatar name={u.name} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{u.name}</p>
              <p className="truncate text-xs text-grey-500">{u.email}</p>
            </div>
          </div>
        );
      },
    },

    /* ── Portal ── */
    {
      accessorKey: "portal",
      enableSorting: false,
      header: "Portal",
      cell: ({ row }: { row: Row<User> }) => (
        <PortalBadge portal={row.original.portal ?? "merchant"} />
      ),
    },

    /* ── Roles ── */
    {
      id: "roles",
      enableSorting: false,
      header: "Roles",
      cell: ({ row }: { row: Row<User> }) => {
        const u = row.original;
        if ((u.roles ?? []).length === 0) {
          if (u.requestedRole) {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs text-grey-500">
                <CheckCircle className="size-3" />
                ขอ:&nbsp;
                <RoleBadge roleId={u.requestedRole} roles={roles} />
              </span>
            );
          }
          return <span className="text-xs text-grey-400">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {(u.roles ?? []).map((r) => (
              <RoleBadge key={r} roleId={r} roles={roles} />
            ))}
          </div>
        );
      },
    },

    /* ── รหัส-IdP ── */
    {
      id: "idpCode",
      enableSorting: false,
      header: "รหัส-IdP",
      cell: ({ row }: { row: Row<User> }) => {
        const u = row.original;
        return (
          <>
            <p className="font-mono text-xs">{u.empId ?? u.agentCode ?? "—"}</p>
            <IdpBadge provider={u.idp ?? "google"} />
          </>
        );
      },
    },

    /* ── วันที่สร้าง ── */
    {
      accessorKey: "createdAt",
      enableSorting: true,
      sortingFn: (a, b) =>
        (a.original.createdAt ?? "").localeCompare(
          b.original.createdAt ?? "",
          "th",
        ),
      header: "วันที่สร้าง",
      cell: ({ row }: { row: Row<User> }) => (
        <span className="text-xs text-grey-500">
          {row.original.createdAt ?? "—"}
        </span>
      ),
    },

    /* ── เข้าใช้ล่าสุด ── */
    {
      accessorKey: "lastLogin",
      enableSorting: false,
      header: "เข้าใช้ล่าสุด",
      cell: ({ row }: { row: Row<User> }) => (
        <span className="text-xs text-grey-500">
          {row.original.lastLogin ?? "—"}
        </span>
      ),
    },

    /* ── สถานะ ── */
    {
      accessorKey: "status",
      enableSorting: true,
      sortingFn: (a, b) =>
        a.original.status.localeCompare(b.original.status, "th"),
      header: "สถานะ",
      cell: ({ row }: { row: Row<User> }) => {
        const cfg =
          STATUS_CONFIG[row.original.status] ?? STATUS_CONFIG["disabled"]!;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
              cfg.cls,
            )}
          >
            <span className="size-1.5 shrink-0 rounded-full bg-current opacity-80" />
            {cfg.label}
          </span>
        );
      },
    },

    /* ── actions ── */
    {
      id: "actions",
      enableSorting: false,
      meta: { headClassName: "w-20", cellClassName: "w-20" },
      header: () => null,
      cell: ({ row }: { row: Row<User> }) => {
        const u = row.original;
        return (
          <span onClick={(e) => e.stopPropagation()}>
            {u.status === "pending" ? (
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="sm"
                  onClick={() => onApprove(u)}
                  className="gap-1 bg-success text-white hover:bg-success/90"
                >
                  <CheckCircle className="size-3.5" />
                  อนุมัติ
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onReject(u)}
                  className="border-error/40 text-error hover:bg-error/10"
                  title="ปฏิเสธ"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => onOpenDrawer(u)}
                  title="แก้ไข Role"
                  className="text-grey-500 hover:text-foreground"
                >
                  <Settings className="size-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => onToggleDisable(u)}
                  title={u.status === "disabled" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  className="text-grey-500 hover:text-foreground"
                >
                  {u.status === "disabled" ? (
                    <CheckCircle className="size-3.5" />
                  ) : (
                    <XCircle className="size-3.5" />
                  )}
                </Button>
              </div>
            )}
          </span>
        );
      },
    },
  ];
}
