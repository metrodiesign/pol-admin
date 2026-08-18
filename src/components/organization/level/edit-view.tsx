"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Level } from "@/types/organization/level";
import { LEVEL_BASE_PATH, LEVEL_LABEL } from "@/lib/organization/level/config";
import { validateLevelForm } from "@/lib/organization/level/form";
import { getLevel, updateLevel } from "@/lib/api/admin/level";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { OrgUnitFormStatus } from "@/components/organization/org-unit/form-status";
import { OrgUnitConfirmDialog } from "@/components/organization/org-unit/confirm-dialog";
import {
  STATUS_OPTIONS,
  statusOf,
  type OrgUnitStatus,
} from "@/components/organization/org-unit/status-badge";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

interface LevelEditViewProps {
  /** id (Guid) ของรายการ — view โหลดเองจาก GET /api/v1/levels/{id}. */
  id: string;
}

/**
 * หน้าแก้ไข level — code read-only (identity), แก้ได้ name + สถานะ.
 * PUT ส่ง {name, isActive} ครบทุกครั้ง (full-replace — REQ-5.4);
 * การเปิดใช้งานรายการกลับทำผ่าน status select ที่นี่ทางเดียว (REQ-5.7)
 */
export function LevelEditView({ id }: LevelEditViewProps) {
  const router = useRouter();
  const [unit, setUnit] = useState<Level | null>(null);
  const [load, setLoad] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<OrgUnitStatus>("active");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const listHref = `${LEVEL_BASE_PATH}/list`;

  useEffect(() => {
    let active = true;
    getLevel(id)
      .then((u) => {
        if (!active) return;
        if (!u) {
          setLoad("notfound");
          return;
        }
        setUnit(u);
        setName(u.name);
        setStatus(statusOf(u.isActive));
        setLoad("ok");
      })
      .catch(() => {
        if (active) setLoad("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  const dirty = unit !== null && (name !== unit.name || status !== statusOf(unit.isActive));

  async function handleSave() {
    if (!unit || saving) return;
    const found = validateLevelForm({ code: unit.code, name }, "edit");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaving(true);
    // body ครบทั้ง name + isActive เสมอ — backend เป็น full-replace ขาด isActive = โดนปิดใช้งานเงียบ
    const res = await updateLevel(id, {
      name: name.trim(),
      isActive: status === "active",
    });
    setSaving(false);
    if (res.status === 404) {
      setErrors({ name: "ไม่พบรายการ อาจถูกเปลี่ยนแปลงแล้ว — กลับไปหน้ารายการแล้วลองใหม่" });
      return;
    }
    if (!res.ok) {
      setErrors({ name: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" });
      return;
    }
    router.push(
      `${listHref}?toast=${encodeURIComponent(`แก้ไข${LEVEL_LABEL} "${name.trim()}" สำเร็จ`)}`,
    );
  }

  function handleCancel() {
    if (dirty) {
      setConfirmCancel(true);
      return;
    }
    router.push(listHref);
  }

  const header = (
    <EditPageHeader
      title={`แก้ไข${LEVEL_LABEL}`}
      backHref={listHref}
      breadcrumbs={[
        { label: "Console" },
        { label: LEVEL_LABEL, href: listHref },
        { label: unit?.name ?? `แก้ไข${LEVEL_LABEL}` },
      ]}
    />
  );

  if (load === "loading") {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="loading" backHref={listHref} label={LEVEL_LABEL} />
      </>
    );
  }
  if (load === "notfound") {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="notfound" backHref={listHref} label={LEVEL_LABEL} />
      </>
    );
  }
  if (load === "error" || !unit) {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="error" backHref={listHref} label={LEVEL_LABEL} />
      </>
    );
  }

  return (
    <>
      {header}

      <div className="rounded-card bg-card p-6" style={cardStyle}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label={`ชื่อ${LEVEL_LABEL}`}
            required
            value={name}
            onChange={setName}
            error={errors.name}
          />
          <TextField
            label="รหัส"
            value={unit.code}
            disabled
            helperText="รหัสเป็น identity คงที่ แก้ไขไม่ได้หลังสร้าง"
          />
          <SelectField
            label="สถานะ"
            className="sm:w-48"
            value={status}
            onChange={(v) => setStatus((v || "active") as OrgUnitStatus)}
            options={STATUS_OPTIONS}
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
        description="การแก้ไขที่ยังไม่บันทึกจะหายไป"
        confirmLabel="ออกโดยไม่บันทึก"
        onConfirm={() => {
          setConfirmCancel(false);
          router.push(listHref);
        }}
      />
    </>
  );
}
