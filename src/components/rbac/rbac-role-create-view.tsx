"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Role, RoleStatus, RoleFormInput } from "@/types/rbac";
import { PERMISSION_CATALOG, RBAC_ROLES, RESOURCE_GROUPS } from "@/lib/mock/rbac";
import { makeCopyCode, validateRoleForm } from "@/lib/rbac/role-permissions";
import { cn } from "@/lib/utils";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { RbacPermissionMatrix } from "./rbac-permission-matrix";
import { ROLE_COLOR_OPTIONS } from "./rbac-role-badge";
import { STATUS_OPTIONS } from "./rbac-role-status-badge";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

const cancelClass =
  "inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

interface RbacRoleCreateViewProps {
  /** บทบาทต้นทางสำหรับโหมดทำสำเนา (prefill); ไม่มี = สร้างใหม่ */
  source?: Role | null;
}

/**
 * หน้าสร้างบทบาทแบบเต็มหน้า (route แยก /user/rbac/create).
 * source ว่าง = สร้างใหม่; มี source = ทำสำเนา (prefill code/name/perms). code แก้ไขได้. UI-shell.
 */
export function RbacRoleCreateView({ source }: RbacRoleCreateViewProps) {
  const router = useRouter();
  const existingCodes = RBAC_ROLES.map((r) => r.code);
  const isDuplicate = Boolean(source);

  const [input, setInput] = useState<RoleFormInput>(() =>
    source
      ? {
          code: makeCopyCode(source.code, existingCodes),
          name: `${source.name} (สำเนา)`,
          description: source.description,
          color: source.color,
          status: source.status,
          permissions: [...source.permissions],
        }
      : {
          code: "",
          name: "",
          description: "",
          color: "blue",
          status: "active",
          permissions: [],
        },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function patch(p: Partial<RoleFormInput>) {
    setInput((prev) => ({ ...prev, ...p }));
  }

  function handleSave() {
    const found = validateRoleForm(input, existingCodes, "create");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    // UI-shell: ไม่ mutate รายการจริง — กลับหน้า list พร้อม toast (REQ-10.2 / 13.1)
    const verb = isDuplicate ? "ทำสำเนาบทบาท" : "สร้างบทบาท";
    router.push(
      `/user/rbac?toast=${encodeURIComponent(`${verb} “${input.name}” สำเร็จ`)}`,
    );
  }

  const title = isDuplicate ? "ทำสำเนาบทบาท" : "สร้างบทบาทใหม่";

  return (
    <>
      <EditPageHeader
        title={title}
        backHref="/user/rbac"
        breadcrumbs={[
          { label: "Console" },
          { label: "บทบาทและสิทธิ์", href: "/user/rbac" },
          { label: title },
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
            placeholder="เช่น ผู้ดูแลการเงิน"
          />
          <TextField
            label="รหัสบทบาท"
            required
            value={input.code}
            onChange={(v) => patch({ code: v })}
            error={errors.code}
            placeholder="เช่น finance_admin"
          />
          <TextField
            label="คำอธิบาย"
            className="sm:col-span-2"
            multiline
            rows={2}
            value={input.description}
            onChange={(v) => patch({ description: v })}
            placeholder="อธิบายขอบเขตของบทบาทนี้"
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
