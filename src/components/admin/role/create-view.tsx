"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RoleStatus, RoleFormInput } from "@/types/admin/role";
import { getRoles, createRole } from "@/lib/api/admin-api";
import { useRoleCatalog } from "@/hooks/use-role-catalog";
import { makeCopyCode, validateRoleForm } from "@/lib/admin/role/permissions";
import { cn } from "@/lib/utils";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { RolePermissionMatrix } from "./permission-matrix";
import { RoleFormStatus } from "./form-status";
import { ROLE_COLOR_OPTIONS } from "./badge";
import { STATUS_OPTIONS } from "./status-badge";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

const cancelClass =
  "inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]";

const blankInput: RoleFormInput = {
  code: "",
  name: "",
  description: "",
  color: "blue",
  status: "active",
  permissions: [],
};

interface RoleCreateViewProps {
  /** code ของบทบาทต้นทางสำหรับโหมดทำสำเนา; null = สร้างใหม่ */
  from?: string | null;
}

/**
 * หน้าสร้างบทบาทแบบเต็มหน้า (route แยก /user/role/create).
 * from ว่าง = สร้างใหม่; มี from = ทำสำเนา (prefill จากบทบาทต้นทาง). code แก้ไขได้.
 */
export function RoleCreateView({ from }: RoleCreateViewProps) {
  const router = useRouter();
  const cat = useRoleCatalog();
  const [load, setLoad] = useState<"loading" | "ok" | "error">("loading");
  const [existingCodes, setExistingCodes] = useState<string[]>([]);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [input, setInput] = useState<RoleFormInput | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getRoles()
      .then((list) => {
        if (!active) return;
        const codes = list.map((r) => r.code);
        setExistingCodes(codes);
        const source = from ? (list.find((r) => r.code === from) ?? null) : null;
        setIsDuplicate(Boolean(source));
        setInput(
          source
            ? {
                code: makeCopyCode(source.code, codes),
                name: `${source.name} (สำเนา)`,
                description: source.description,
                color: source.color,
                status: source.status,
                permissions: [...source.permissions],
              }
            : { ...blankInput },
        );
        setLoad("ok");
      })
      .catch(() => {
        if (active) setLoad("error");
      });
    return () => {
      active = false;
    };
  }, [from]);

  function patch(p: Partial<RoleFormInput>) {
    setInput((prev) => (prev ? { ...prev, ...p } : prev));
  }

  async function handleSave() {
    if (!input || saving) return;
    const found = validateRoleForm(input, existingCodes, "create");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaving(true);
    const res = await createRole(input);
    setSaving(false);
    if (res.status === 409) {
      setErrors({ code: "รหัสนี้ถูกใช้แล้ว" });
      return;
    }
    if (!res.ok) {
      setErrors({ name: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" });
      return;
    }
    const verb = isDuplicate ? "ทำสำเนาบทบาท" : "สร้างบทบาท";
    router.push(
      `/admin/role/list?toast=${encodeURIComponent(`${verb} “${input.name}” สำเร็จ`)}`,
    );
  }

  const title = isDuplicate ? "ทำสำเนาบทบาท" : "สร้างบทบาทใหม่";
  const header = (
    <EditPageHeader
      title={title}
      backHref="/admin/role/list"
      breadcrumbs={[
        { label: "Console" },
        { label: "บทบาทและสิทธิ์", href: "/admin/role/list" },
        { label: title },
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
            <RolePermissionMatrix
              catalog={cat.catalog.permissions}
              groups={cat.catalog.groups}
              selected={input.permissions}
              onChange={(next) => patch({ permissions: next })}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link href="/admin/role/list" className={cancelClass}>
            ยกเลิก
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก…" : "บันทึก"}
          </button>
        </div>
      </div>
    </>
  );
}
