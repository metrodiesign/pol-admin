"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrgUnitConfig } from "@/lib/organization/org-unit/config";
import { validateOrgUnitForm } from "@/lib/organization/org-unit/form";
import { createOrgUnit } from "@/lib/api/admin/org-unit";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { TextField } from "@/components/form/text-field";
import { OrgUnitConfirmDialog } from "./confirm-dialog";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

interface OrgUnitCreateViewProps {
  config: OrgUnitConfig;
}

/**
 * หน้าสร้าง org unit แบบเต็มหน้า — field แค่ code + name (รายการใหม่เกิดเป็น active เสมอ).
 * ไม่ preload list เช็ค code ซ้ำ — ให้ server ตอบ 409 (REQ-4.6)
 */
export function OrgUnitCreateView({ config }: OrgUnitCreateViewProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const listHref = `${config.basePath}/list`;
  const title = `เพิ่ม${config.label}`;
  const dirty = code.trim() !== "" || name.trim() !== "";

  async function handleSave() {
    if (saving) return;
    const found = validateOrgUnitForm({ code, name }, "create");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaving(true);
    const res = await createOrgUnit(config.segment, {
      code: code.trim(),
      name: name.trim(),
    });
    setSaving(false);
    if (res.status === 409) {
      setErrors({ code: "รหัสนี้ถูกใช้แล้ว" });
      return;
    }
    if (!res.ok) {
      setErrors({ name: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" });
      return;
    }
    router.push(
      `${listHref}?toast=${encodeURIComponent(`เพิ่ม${config.label} "${name.trim()}" สำเร็จ`)}`,
    );
  }

  // ยกเลิก: ฟอร์ม dirty ต้องยืนยันก่อนออก (REQ-4.8) — ดักเฉพาะปุ่มนี้ ไม่ทำ beforeunload
  function handleCancel() {
    if (dirty) {
      setConfirmCancel(true);
      return;
    }
    router.push(listHref);
  }

  return (
    <>
      <EditPageHeader
        title={title}
        backHref={listHref}
        breadcrumbs={[
          { label: "Console" },
          { label: config.label, href: listHref },
          { label: title },
        ]}
      />

      <div className="rounded-card bg-card p-6" style={cardStyle}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label={`ชื่อ${config.label}`}
            required
            value={name}
            onChange={setName}
            error={errors.name}
            placeholder="เช่น สำนักงานใหญ่"
          />
          <TextField
            label="รหัส"
            required
            value={code}
            onChange={setCode}
            error={errors.code}
            placeholder="เช่น hq (a-z, 0-9, _)"
            helperText="ใช้ได้เฉพาะ a-z, 0-9 และ _ — แก้ไขไม่ได้หลังสร้าง"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก…" : "บันทึก"}
          </button>
        </div>
      </div>

      <OrgUnitConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="ออกจากหน้านี้?"
        description="ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก"
        confirmLabel="ออกโดยไม่บันทึก"
        onConfirm={() => {
          setConfirmCancel(false);
          router.push(listHref);
        }}
      />
    </>
  );
}
