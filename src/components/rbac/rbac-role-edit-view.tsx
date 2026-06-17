"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Role, RoleColor, RoleStatus, RoleFormInput } from "@/types/rbac";
import { PERMISSION_CATALOG, RBAC_ROLES, RESOURCE_GROUPS } from "@/lib/mock/rbac";
import { validateRoleForm } from "@/lib/rbac/role-permissions";
import { cn } from "@/lib/utils";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { RbacPermissionMatrix } from "./rbac-permission-matrix";
import { STATUS_OPTIONS } from "./rbac-role-status-badge";

const COLOR_OPTIONS: { value: RoleColor; label: string; dot: string }[] = [
  { value: "red", label: "แดง", dot: "bg-error" },
  { value: "blue", label: "น้ำเงิน", dot: "bg-info" },
  { value: "green", label: "เขียว", dot: "bg-success" },
  { value: "amber", label: "เหลือง", dot: "bg-warning" },
  { value: "gray", label: "เทา", dot: "bg-grey-500" },
];

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

const cancelClass =
  "inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

interface RbacRoleEditViewProps {
  role: Role;
}

/** หน้าแก้ไขบทบาทแบบเต็มหน้า (route แยก /user/rbac/edit). code read-only (REQ-7.3). UI-shell. */
export function RbacRoleEditView({ role }: RbacRoleEditViewProps) {
  const router = useRouter();
  const [input, setInput] = useState<RoleFormInput>(() => ({
    code: role.code,
    name: role.name,
    description: role.description,
    color: role.color,
    status: role.status,
    permissions: [...role.permissions],
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const existingCodes = RBAC_ROLES.map((r) => r.code);

  function patch(p: Partial<RoleFormInput>) {
    setInput((prev) => ({ ...prev, ...p }));
  }

  function handleSave() {
    const found = validateRoleForm(input, existingCodes, "edit");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    // UI-shell: ไม่ mutate รายการจริง — กลับหน้า list พร้อม toast (REQ-7.2 / 10.2 / 13.1)
    const toast = `แก้ไขบทบาท “${input.name}” สำเร็จ`;
    router.push(`/user/rbac?toast=${encodeURIComponent(toast)}`);
  }

  return (
    <>
      <EditPageHeader
        title="แก้ไขบทบาท"
        backHref="/user/rbac"
        breadcrumbs={[
          { label: "Console" },
          { label: "บทบาทและสิทธิ์", href: "/user/rbac" },
          { label: role.name },
        ]}
      />

      <div className="rounded-card bg-card p-6" style={cardStyle}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="ชื่อบทบาท"
            required
            value={input.name}
            onChange={(v) => patch({ name: v })}
            error={errors.name}
          />
          <TextField
            label="รหัสบทบาท"
            value={input.code}
            disabled
            helperText="รหัสบทบาทเป็น identity คงที่ แก้ไขไม่ได้หลังสร้าง"
          />
          <TextField
            label="คำอธิบาย"
            className="sm:col-span-2"
            multiline
            rows={2}
            value={input.description}
            onChange={(v) => patch({ description: v })}
          />
          <SelectField
            label="สถานะ"
            className="sm:w-48"
            value={input.status}
            onChange={(v) => patch({ status: (v || "active") as RoleStatus })}
            options={STATUS_OPTIONS}
          />
          <div className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-sm font-medium text-grey-800">สีป้ายกำกับ</span>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((o) => {
                const selected = input.color === o.value;
                return (
                  <button
                    type="button"
                    key={o.value}
                    onClick={() => patch({ color: o.value })}
                    aria-label={o.label}
                    aria-pressed={selected}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-grey-800 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      selected &&
                        "ring-2 ring-foreground ring-offset-2 ring-offset-card",
                    )}
                  >
                    <span className={cn("size-6 rounded-full", o.dot)} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-sm font-medium text-grey-800">สิทธิ์</span>
          <div className="-mx-6 border-t border-[var(--divider)]">
            <RbacPermissionMatrix
              catalog={PERMISSION_CATALOG}
              groups={RESOURCE_GROUPS}
              selected={input.permissions}
              onChange={(next) => patch({ permissions: next })}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link href="/user/rbac" className={cancelClass}>
            ยกเลิก
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900"
          >
            บันทึก
          </button>
        </div>
      </div>
    </>
  );
}
