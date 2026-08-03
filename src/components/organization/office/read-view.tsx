"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import type { Office } from "@/types/organization/office";
import { OFFICE_BASE_PATH, OFFICE_LABEL } from "@/lib/organization/office/config";
import { getOffice } from "@/lib/api/admin/office";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { OrgUnitFormStatus } from "@/components/organization/org-unit/form-status";
import { OrgUnitStatusBadge } from "@/components/organization/org-unit/status-badge";

const fieldLabel = "mb-1.5 block text-xs font-semibold text-grey-700";

interface OfficeReadViewProps {
  /** id (Guid) ของรายการ — view โหลดเองจาก GET /api/v1/offices/{id}. */
  id: string;
}

/** หน้าดูรายละเอียด office แบบเต็มหน้า — read-only + ปุ่มไปหน้าแก้ไข. */
export function OfficeReadView({ id }: OfficeReadViewProps) {
  const [unit, setUnit] = useState<Office | null>(null);
  const [load, setLoad] = useState<"loading" | "ok" | "notfound" | "error">("loading");

  const listHref = `${OFFICE_BASE_PATH}/list`;

  useEffect(() => {
    let active = true;
    getOffice(id)
      .then((u) => {
        if (!active) return;
        if (!u) {
          setLoad("notfound");
          return;
        }
        setUnit(u);
        setLoad("ok");
      })
      .catch(() => {
        if (active) setLoad("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  const header = (
    <EditPageHeader
      title={`ดู${OFFICE_LABEL}`}
      backHref={listHref}
      breadcrumbs={[
        { label: "Console" },
        { label: OFFICE_LABEL, href: listHref },
        { label: unit?.name ?? `ดู${OFFICE_LABEL}` },
      ]}
    />
  );

  if (load === "loading") {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="loading" backHref={listHref} label={OFFICE_LABEL} />
      </>
    );
  }
  if (load === "notfound") {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="notfound" backHref={listHref} label={OFFICE_LABEL} />
      </>
    );
  }
  if (load === "error" || !unit) {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="error" backHref={listHref} label={OFFICE_LABEL} />
      </>
    );
  }

  return (
    <>
      <EditPageHeader
        title={`ดู${OFFICE_LABEL}`}
        backHref={listHref}
        breadcrumbs={[
          { label: "Console" },
          { label: OFFICE_LABEL, href: listHref },
          { label: unit.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={listHref}
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
            >
              กลับ
            </Link>
            <Link
              href={`${OFFICE_BASE_PATH}/edit?id=${encodeURIComponent(unit.id)}`}
              className="inline-flex h-11 min-w-[140px] items-center justify-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Pencil className="size-4" />
              แก้ไข
            </Link>
          </div>
        }
      />

      {/* Card ข้อมูล — โครงเดียวกับ card "ข้อมูลธุรกรรม" ของหน้า transaction read */}
      <section
        className="rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="px-6 py-5">
          <p className="text-base font-bold text-primary">ข้อมูล{OFFICE_LABEL}</p>
        </div>
        <div className="border-t border-[var(--divider)]" />
        <div className="px-6 pt-5 pb-6">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <p className={fieldLabel}>รหัส</p>
              <p className="text-sm font-bold text-foreground">{unit.code}</p>
            </div>
            <div>
              <p className={fieldLabel}>ชื่อ{OFFICE_LABEL}</p>
              <p className="text-sm font-bold text-foreground">{unit.name}</p>
            </div>
            <div>
              <p className={fieldLabel}>สถานะ</p>
              <OrgUnitStatusBadge isActive={unit.isActive} />
            </div>
          </div>
          {!unit.isActive && (
            <p className="mt-4 text-xs text-grey-500">
              รายการที่ปิดใช้งานยังถูกอ้างอิงจากข้อมูลเดิมได้ แต่เลือกใช้ใหม่ไม่ได้ —
              เปิดใช้งานกลับได้จากหน้าแก้ไข
            </p>
          )}
        </div>
      </section>
    </>
  );
}
