"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  USER_ROLES,
  USER_OFFICES,
  USER_DEPARTMENTS,
  USER_POSITIONS,
  USER_LEVELS,
} from "@/lib/mock/users";

const officeOptions = USER_OFFICES.map((v) => ({ value: v, label: v }));
const departmentOptions = USER_DEPARTMENTS.map((v) => ({ value: v, label: v }));
const positionOptions = USER_POSITIONS.map((v) => ({ value: v, label: v }));
const levelOptions = USER_LEVELS.map((v) => ({ value: v, label: v }));
const statusOptions = [
  { value: "active", label: "ใช้งาน" },
  { value: "banned", label: "ระงับ" },
];

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  office: string;
  department: string;
  position: string;
  level: string;
  roles: string[];
}

interface UserEditFormCardProps {
  initialData: UserFormData;
  onSave?: (data: UserFormData) => void;
  submitLabel?: string;
  /** View-only: render values as plain text (no inputs), no submit button. */
  readOnly?: boolean;
  /** When set, render a Cancel button linking back to this path. */
  cancelHref?: string;
  /**
   * Set on the <form> so an external submit button can target it via the HTML `form` attribute.
   * When set, the built-in Cancel/Save row is skipped — the caller renders its own actions elsewhere.
   */
  formId?: string;
}

const cancelClass =
  "inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

export function UserEditFormCard({
  initialData,
  onSave,
  submitLabel = "บันทึกการเปลี่ยนแปลง",
  readOnly = false,
  cancelHref,
  formId,
}: UserEditFormCardProps) {
  const [form, setForm] = useState<UserFormData>(initialData);

  function update(field: keyof UserFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleRole(role: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      roles: checked ? [...prev.roles, role] : prev.roles.filter((r) => r !== role),
    }));
  }

  function toggleAllRoles(allSelected: boolean) {
    setForm((prev) => ({ ...prev, roles: allSelected ? [] : [...USER_ROLES] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave?.(form);
  }

  if (readOnly) {
    const rows: Array<[string, string]> = [
      ["ชื่อ", form.firstName],
      ["นามสกุล", form.lastName],
      ["อีเมล", form.email],
      ["สำนักงาน", form.office],
      ["แผนก", form.department],
      ["ตำแหน่ง", form.position],
      ["ระดับ", form.level],
    ];
    const statusLabel = statusOptions.find((o) => o.value === form.status)?.label ?? form.status;

    return (
      <div className="overflow-hidden rounded-card bg-card p-6" style={cardStyle}>
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-grey-600">{label}</dt>
              <dd className="text-sm font-bold text-foreground">{value || "-"}</dd>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <dt className="text-sm font-medium text-grey-600">สถานะ</dt>
            <dd>
              <span
                className={
                  form.status === "active"
                    ? "inline-flex items-center rounded-full bg-success/16 px-4 py-1 text-sm font-semibold text-success-dark"
                    : "inline-flex items-center rounded-full bg-error/16 px-4 py-1 text-sm font-semibold text-error-dark"
                }
              >
                {statusLabel}
              </span>
            </dd>
          </div>
        </dl>

        <div className="-mx-6 mt-6 border-t border-[var(--divider)]">
          <div className="flex items-center justify-between bg-grey-100 px-6 py-2.5">
            <span className="text-sm font-semibold text-grey-700">บทบาท</span>
            <span className="text-sm tabular-nums text-grey-500">
              {form.roles.length}/{USER_ROLES.length}
            </span>
          </div>
          <ul className="flex flex-col">
            {form.roles.map((r) => (
              <li
                key={r}
                className="flex items-center gap-3 border-b border-[var(--divider)] px-6 py-3"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/16">
                  <Check className="size-3.5 text-success" />
                </span>
                <span className="text-sm font-bold text-foreground">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {cancelHref && (
          <div className="mt-6 flex justify-end">
            <Link href={cancelHref} className={cancelClass}>
              ยกเลิก
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-card bg-card p-6" style={cardStyle}>
      <form id={formId} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="ชื่อ"
            value={form.firstName}
            onChange={(v) => update("firstName", v)}
          />
          <TextField
            label="นามสกุล"
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
          />
          <TextField
            label="อีเมล"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
          />

          <SelectField
            label="สำนักงาน"
            value={form.office}
            onChange={(v) => update("office", v)}
            options={officeOptions}
          />
          <SelectField
            label="แผนก"
            value={form.department}
            onChange={(v) => update("department", v)}
            options={departmentOptions}
          />
          <SelectField
            label="ตำแหน่ง"
            value={form.position}
            onChange={(v) => update("position", v)}
            options={positionOptions}
          />
          <SelectField
            label="ระดับ"
            value={form.level}
            onChange={(v) => update("level", v)}
            options={levelOptions}
          />
          <SelectField
            label="สถานะ"
            value={form.status}
            onChange={(v) => update("status", v)}
            options={statusOptions}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <div className="-mx-6 border-t border-[var(--divider)]">
            <div className="flex items-center gap-2 bg-grey-100 px-4 py-1.5">
              <Checkbox
                checked={form.roles.length === USER_ROLES.length}
                indeterminate={form.roles.length > 0 && form.roles.length < USER_ROLES.length}
                onChange={() => toggleAllRoles(form.roles.length === USER_ROLES.length)}
                aria-label="เลือกบทบาททั้งหมด"
              />
              <span className="text-sm font-semibold text-grey-700">บทบาท</span>
              <span className="ml-auto text-sm tabular-nums text-grey-500">
                {form.roles.length}/{USER_ROLES.length}
              </span>
            </div>
            <ul className="flex flex-col">
              {USER_ROLES.map((r) => (
                <li key={r}>
                  <label className="flex cursor-pointer items-center gap-2 border-b border-[var(--divider)] px-4 py-1.5 hover:bg-[var(--action-hover)]">
                    <Checkbox
                      checked={form.roles.includes(r)}
                      onChange={(c) => toggleRole(r, c)}
                      aria-label={r}
                    />
                    <span className="text-sm text-foreground">{r}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!formId && (
          <div className="mt-6 flex items-center justify-end gap-3">
            {cancelHref && (
              <Link href={cancelHref} className={cancelClass}>
                ยกเลิก
              </Link>
            )}
            <button
              type="submit"
              className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {submitLabel}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
