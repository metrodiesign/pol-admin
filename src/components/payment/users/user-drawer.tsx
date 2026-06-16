"use client";

import { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EntityDrawer } from "@/components/payment/entity-drawer";
import { cn } from "@/lib/utils";
import type { User, UserStatus, UserPortal } from "@/types/user";
import type { Role } from "@/types/role";
import type { Permission } from "@/types/permission";

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

const STATUS_CONFIG: Record<UserStatus, { label: string; cls: string }> = {
  active:   { label: "ใช้งานอยู่",  cls: "bg-success/12 text-success-dark" },
  pending:  { label: "รออนุมัติ",  cls: "bg-warning/12 text-warning-dark" },
  disabled: { label: "ปิดใช้งาน",  cls: "bg-grey-500/10 text-grey-600" },
  banned:   { label: "ถูกระงับ",    cls: "bg-error/10 text-error-dark" },
  rejected: { label: "ปฏิเสธแล้ว", cls: "bg-grey-500/10 text-grey-600" },
};

const ROLE_COLOR_CLASS: Record<string, string> = {
  danger:  "bg-error/10 text-error-dark",
  warning: "bg-warning/12 text-warning-dark",
  info:    "bg-primary/10 text-primary",
  success: "bg-success/12 text-success-dark",
  neutral: "bg-grey-500/10 text-grey-600",
  primary: "bg-primary/10 text-primary",
};

const CHANNEL_LABEL: Record<string, string> = {
  card: "บัตรเครดิต/เดบิต",
  qr:   "QR Code",
  installment: "ผ่อนชำระ",
};

/* ─── Personal data row ─── */
interface DataRowProps {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}

function DataRow({ label, value, mono, last }: DataRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5",
        !last && "border-b border-[rgba(145,158,171,0.08)]",
      )}
    >
      <span className="flex-1 text-sm text-grey-500">{label}</span>
      <span className={cn("text-sm font-semibold", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}

/* ─── Avatar ─── */
function UserAvatar({ name, large }: { name: string; large?: boolean }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 font-bold text-white",
        large ? "size-14 text-lg" : "size-[34px] text-sm",
      )}
    >
      {initials}
    </div>
  );
}

/* ─── Props ─── */
export interface UserDrawerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<User>) => void;
  roles: Role[];
  permissions: Permission[];
}

export function UserDrawer({
  user,
  open,
  onOpenChange,
  onSave,
  roles,
  permissions,
}: UserDrawerProps) {
  const [prevUserId, setPrevUserId] = useState(user?.id ?? null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user?.roles ?? []);

  // Previous-prop pattern: reset selectedRoles when user identity changes
  if ((user?.id ?? null) !== prevUserId) {
    setPrevUserId(user?.id ?? null);
    setSelectedRoles(user?.roles ?? []);
  }

  if (!user) return null;

  const toggleRole = (id: string) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const availableRoles = roles.filter(
    (r) => r.portal === (user.portal ?? "merchant"),
  );

  const effective = new Set<string>();
  selectedRoles.forEach((rid) => {
    const role = roles.find((r) => r.id === rid);
    (role?.permissions ?? []).forEach((p) => effective.add(p));
  });

  const statusCfg = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.disabled;

  /* personal data rows */
  const personalRows: DataRowProps[] = [
    user.portal === "admin"
      ? { label: "รหัสพนักงาน", value: user.empId ?? "—", mono: true }
      : { label: "รหัสตัวแทน",  value: user.agentCode ?? "—", mono: true },
    user.portal === "merchant"
      ? {
          label: "ประเภทบุคคล",
          value:
            user.personType === "natural"
              ? "บุคคลธรรมดา"
              : user.personType === "juristic"
              ? "นิติบุคคล"
              : "—",
        }
      : { label: "สถานที่ปฏิบัติงาน", value: user.location ?? "—" },
    ...(user.portal === "merchant"
      ? [
          {
            label: "เลขประจำตัวประชาชน/ผู้เสียภาษี",
            value: user.citizenId ?? "—",
            mono: true,
          },
        ]
      : []),
    { label: "หมายเลขโทรศัพท์", value: user.phoneNumber ?? "—", mono: true },
    { label: "อีเมล (จาก IdP)",  value: user.email, mono: true },
    ...(user.portal === "merchant" && user.channels
      ? [
          {
            label: "ช่องทางรับชำระ",
            value: user.channels
              .map((c) => CHANNEL_LABEL[c] ?? c)
              .join(", "),
          },
        ]
      : []),
    { label: "วันที่สร้างบัญชี", value: user.createdAt ?? "—" },
  ];

  const drawerHeader = (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onOpenChange(false)}
        className="shrink-0"
      >
        <X className="size-4" />
      </Button>
      <div className="flex-1 min-w-0">
        <SheetTitle className="text-xs font-semibold uppercase tracking-[0.06em] text-grey-500">
          ข้อมูลผู้ใช้งาน
        </SheetTitle>
        <p className="mt-0.5 font-mono text-sm font-bold">{user.id}</p>
      </div>
    </>
  );

  const drawerFooter = (
    <>
      <Button variant="ghost" onClick={() => onOpenChange(false)}>
        ยกเลิก
      </Button>
      <div className="flex-1" />
      <Button onClick={() => onSave({ roles: selectedRoles })}>
        <CheckCircle className="size-4" />
        บันทึก
      </Button>
    </>
  );

  return (
    <EntityDrawer
      open={open}
      onOpenChange={onOpenChange}
      header={drawerHeader}
      footer={drawerFooter}
      showCloseButton={false}
      width="w-[90%] sm:max-w-[580px]"
    >
      {/* Body */}
      <div className="py-1">
        {/* Hero */}
        <div className="mb-5 flex items-center gap-3.5">
          <UserAvatar name={user.name} large />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">{user.name}</p>
            <p className="mt-0.5 text-sm text-grey-500">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                  statusCfg.cls,
                )}
              >
                <span className="size-1.5 shrink-0 rounded-full bg-current opacity-80" />
                {statusCfg.label}
              </span>
              <span className="inline-flex items-center rounded-md bg-grey-100 px-2 py-0.5 text-xs font-semibold text-grey-700 dark:bg-grey-800 dark:text-grey-300">
                {(user.portal as UserPortal) === "admin"
                  ? "Admin Portal"
                  : "Merchant Portal"}
              </span>
              <IdpBadge provider={user.idp ?? "google"} />
            </div>
          </div>
        </div>

        {/* Personal data */}
        <section className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-grey-500">
            ข้อมูลส่วนบุคคล
          </p>
          <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.12)]">
            {personalRows.map((row, i) => (
              <DataRow
                key={i}
                label={row.label}
                value={row.value}
                mono={row.mono}
                last={i === personalRows.length - 1}
              />
            ))}
          </div>
        </section>

        {/* Roles editor */}
        <section className="mb-5">
          <div className="mb-2 flex items-center">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-grey-500">
              Roles ({selectedRoles.length})
            </p>
            <span className="ml-auto text-xs text-grey-400">
              เลือกได้หลายบทบาท · permission จะถูกรวม
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {availableRoles.map((r) => {
              const on = selectedRoles.includes(r.id);
              const colorCls =
                ROLE_COLOR_CLASS[r.color] ?? ROLE_COLOR_CLASS.neutral;
              return (
                <label
                  key={r.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border-[1.5px] p-3 transition-colors",
                    on
                      ? "border-primary bg-primary/5"
                      : "border-[rgba(145,158,171,0.2)] bg-background hover:border-grey-400",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleRole(r.id)}
                    className="mt-0.5 accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{r.name}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 font-mono text-xs font-semibold",
                          colorCls,
                        )}
                      >
                        {r.id}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-grey-500">{r.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Effective permissions */}
        <section className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-grey-500">
            สิทธิ์รวม (Effective Permissions · {effective.size}/
            {permissions.length})
          </p>
          <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-[rgba(145,158,171,0.12)] bg-grey-50 p-3 dark:bg-grey-900">
            {permissions.map((p) => {
              const has = effective.has(p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-2",
                    has ? "text-foreground" : "text-grey-400",
                  )}
                >
                  <CheckCircle
                    className={cn(
                      "size-3 shrink-0",
                      has ? "text-success-dark" : "text-grey-300",
                    )}
                  />
                  <span className="flex-1 truncate text-xs">{p.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </EntityDrawer>
  );
}
