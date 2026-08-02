"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role, RoleStatus, RoleFormInput } from "@/types/producer-role";
import { PERMISSION_CATALOG, ROLES, RESOURCE_GROUPS } from "@/lib/mock/producer-role";
import { validateRoleForm } from "@/lib/producer-role/role-permissions";
import { cn } from "@/lib/utils";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { ConfirmDialog } from "@/components/policy/confirm-dialog";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { RolePermissionMatrix } from "./role-permission-matrix";
import { ROLE_COLOR_OPTIONS } from "./role-badge";
import { STATUS_OPTIONS } from "./role-status-badge";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

const cancelClass =
  "inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

interface RoleEditViewProps {
  role: Role;
}

/** หน้าแก้ไขบทบาทแบบเต็มหน้า (route แยก /producer/role/edit). code read-only (REQ-7.3). UI-shell. */
export function RoleEditView({ role }: RoleEditViewProps) {
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
  const [confirmAction, setConfirmAction] = useState<"cancel" | "save" | null>(null);

  const existingCodes = ROLES.map((r) => r.code);

  function patch(p: Partial<RoleFormInput>) {
    setInput((prev) => ({ ...prev, ...p }));
  }

  function handleSaveClick() {
    const found = validateRoleForm(input, existingCodes, "edit");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setConfirmAction("save");
  }

  function handleSaveConfirm() {
    setConfirmAction(null);
    // UI-shell: ไม่ mutate รายการจริง — กลับหน้า list พร้อม toast (REQ-7.2 / 10.2 / 13.1)
    const toast = `แก้ไขบทบาท “${input.name}” สำเร็จ`;
    router.push(`/producer/role/list?toast=${encodeURIComponent(toast)}`);
  }

  return (
    <>
      <EditPageHeader
        title="แก้ไขบทบาท"
        backHref="/producer/role/list"
        breadcrumbs={[
          { label: "Console" },
          { label: "บทบาทและสิทธิ์", href: "/producer/role/list" },
          { label: role.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmAction("cancel")}
              className={cancelClass}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              บันทึก
            </button>
          </div>
        }
      />

      <div className="rounded-card bg-card p-6" style={cardStyle}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
          <TextField
            label="ชื่อบทบาท"
            className="sm:col-span-3"
            required
            value={input.name}
            onChange={(v) => patch({ name: v })}
            error={errors.name}
          />
          <TextField
            label="คำอธิบาย"
            className="sm:col-span-6"
            multiline
            rows={3}
            value={input.description}
            onChange={(v) => patch({ description: v })}
          />
          <SelectField
            label="สถานะ"
            className="sm:col-span-2"
            value={input.status}
            onChange={(v) => patch({ status: (v || "active") as RoleStatus })}
            options={STATUS_OPTIONS}
          />
          <div className="flex flex-col gap-2 sm:col-span-6">
            <span className="text-sm font-medium text-grey-800">สีป้ายกำกับ</span>
            <div className="flex items-center gap-3">
              {ROLE_COLOR_OPTIONS.map((o) => {
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
            <RolePermissionMatrix
              catalog={PERMISSION_CATALOG}
              groups={RESOURCE_GROUPS}
              selected={input.permissions}
              onChange={(next) => patch({ permissions: next })}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === "cancel"}
        title="ต้องการออกจากหน้านี้?"
        description="ข้อมูลที่แก้ไขในหน้านี้จะไม่ถูกบันทึก"
        confirmLabel="ออกจากหน้านี้"
        onConfirm={() => router.push("/producer/role/list")}
        onClose={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "save"}
        title="ยืนยันการบันทึก?"
        description="ระบบจะบันทึกบทบาทตามที่แก้ไขในหน้านี้"
        confirmLabel="ยืนยัน"
        onConfirm={handleSaveConfirm}
        onClose={() => setConfirmAction(null)}
      />
    </>
  );
}
