"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Role, RoleStatus, RoleFormInput } from "@/types/role";
import { getRole, updateRole } from "@/lib/api/admin-api";
import { useRoleCatalog } from "@/hooks/use-role-catalog";
import { validateRoleForm } from "@/lib/role/role-permissions";
import { cn } from "@/lib/utils";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { RolePermissionMatrix } from "./role-permission-matrix";
import { RoleFormStatus } from "./role-form-status";
import { ROLE_COLOR_OPTIONS } from "./role-badge";
import { STATUS_OPTIONS } from "./role-status-badge";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

const cancelClass =
  "inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

interface RoleEditViewProps {
  /** code ของบทบาทที่จะแก้ไข — view โหลดเองจาก GET /admin/roles/{code}. */
  code: string;
}

/** หน้าแก้ไขบทบาทแบบเต็มหน้า (route แยก /user/role/edit). code read-only (REQ-7.3). */
export function RoleEditView({ code }: RoleEditViewProps) {
  const router = useRouter();
  const cat = useRoleCatalog();
  const [role, setRole] = useState<Role | null>(null);
  const [load, setLoad] = useState<"loading" | "ok" | "notfound" | "error">(
    "loading",
  );
  const [input, setInput] = useState<RoleFormInput | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getRole(code)
      .then((r) => {
        if (!active) return;
        if (!r) {
          setLoad("notfound");
          return;
        }
        setRole(r);
        setInput({
          code: r.code,
          name: r.name,
          description: r.description,
          color: r.color,
          status: r.status,
          permissions: [...r.permissions],
        });
        setLoad("ok");
      })
      .catch(() => {
        if (active) setLoad("error");
      });
    return () => {
      active = false;
    };
  }, [code]);

  function patch(p: Partial<RoleFormInput>) {
    setInput((prev) => (prev ? { ...prev, ...p } : prev));
  }

  async function handleSave() {
    if (!input || saving) return;
    const found = validateRoleForm(input, [], "edit");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaving(true);
    const res = await updateRole(code, input);
    setSaving(false);
    if (res.status === 409) {
      setErrors({ name: "ข้อมูลขัดแย้งกับบทบาทอื่น" });
      return;
    }
    if (!res.ok) {
      setErrors({ name: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" });
      return;
    }
    router.push(
      `/user/role/list?toast=${encodeURIComponent(`แก้ไขบทบาท “${input.name}” สำเร็จ`)}`,
    );
  }

  const header = (
    <EditPageHeader
      title="แก้ไขบทบาท"
      backHref="/user/role/list"
      breadcrumbs={[
        { label: "Console" },
        { label: "บทบาทและสิทธิ์", href: "/user/role/list" },
        { label: role?.name ?? "แก้ไขบทบาท" },
      ]}
    />
  );

  if (load === "loading" || cat.loading) {
    return (
      <>
        {header}
        <RoleFormStatus state="loading" />
      </>
    );
  }
  if (load === "notfound") {
    return (
      <>
        {header}
        <RoleFormStatus state="notfound" />
      </>
    );
  }
  if (load === "error" || cat.error || !input || !cat.catalog) {
    return (
      <>
        {header}
        <RoleFormStatus state="error" />
      </>
    );
  }

  return (
    <>
      {header}

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
              catalog={cat.catalog.permissions}
              groups={cat.catalog.groups}
              selected={input.permissions}
              onChange={(next) => patch({ permissions: next })}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link href="/user/role/list" className={cancelClass}>
            ยกเลิก
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900 disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก…" : "บันทึก"}
          </button>
        </div>
      </div>
    </>
  );
}
