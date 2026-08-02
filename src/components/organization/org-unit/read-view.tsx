"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import type { OrgUnit } from "@/types/organization/org-unit";
import type { OrgUnitConfig } from "@/lib/organization/org-unit/config";
import { getOrgUnit } from "@/lib/api/admin/org-unit";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { OrgUnitFormStatus } from "./form-status";
import { OrgUnitStatusBadge } from "./status-badge";

const cardStyle = {
  boxShadow:
    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
};

interface OrgUnitReadViewProps {
  config: OrgUnitConfig;
  /** id (Guid) ของรายการ — view โหลดเองจาก GET /api/v1/{segment}/{id}. */
  id: string;
}

/** หน้าดูรายละเอียด org unit แบบเต็มหน้า — read-only + ปุ่มไปหน้าแก้ไข. */
export function OrgUnitReadView({ config, id }: OrgUnitReadViewProps) {
  const [unit, setUnit] = useState<OrgUnit | null>(null);
  const [load, setLoad] = useState<"loading" | "ok" | "notfound" | "error">("loading");

  const listHref = `${config.basePath}/list`;

  useEffect(() => {
    let active = true;
    getOrgUnit(config.segment, id)
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
  }, [config.segment, id]);

  const header = (
    <EditPageHeader
      title={`ดู${config.label}`}
      backHref={listHref}
      breadcrumbs={[
        { label: "Console" },
        { label: config.label, href: listHref },
        { label: unit?.name ?? `ดู${config.label}` },
      ]}
    />
  );

  if (load === "loading") {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="loading" backHref={listHref} label={config.label} />
      </>
    );
  }
  if (load === "notfound") {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="notfound" backHref={listHref} label={config.label} />
      </>
    );
  }
  if (load === "error" || !unit) {
    return (
      <>
        {header}
        <OrgUnitFormStatus state="error" backHref={listHref} label={config.label} />
      </>
    );
  }

  return (
    <>
      {header}

      <div className="overflow-hidden rounded-card bg-card" style={cardStyle}>
        {/* Header: ชื่อ + สถานะ + รหัส + ปุ่ม */}
        <div className="flex flex-col gap-4 border-b border-[var(--divider)] p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-foreground">{unit.name}</span>
              <OrgUnitStatusBadge isActive={unit.isActive} />
            </div>
            <span className="font-mono text-xs text-grey-500">รหัส: {unit.code}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={listHref}
              className="inline-flex h-9 min-w-[100px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
            >
              กลับ
            </Link>
            <Link
              href={`${config.basePath}/edit?id=${encodeURIComponent(unit.id)}`}
              className="inline-flex h-9 min-w-[100px] items-center justify-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Pencil className="size-4" />
              แก้ไข
            </Link>
          </div>
        </div>

        {/* Body — field ทั้งหมดของ entity */}
        <div className="flex flex-col gap-3 p-6 sm:max-w-md">
          <div className="rounded-control border border-[var(--divider)] p-3">
            <p className="text-xs text-grey-500">รหัส</p>
            <p className="mt-1 font-mono text-sm text-foreground">{unit.code}</p>
          </div>
          <div className="rounded-control border border-[var(--divider)] p-3">
            <p className="text-xs text-grey-500">ชื่อ{config.label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{unit.name}</p>
          </div>
          <div className="rounded-control border border-[var(--divider)] p-3">
            <p className="text-xs text-grey-500">สถานะ</p>
            <p className="mt-1">
              <OrgUnitStatusBadge isActive={unit.isActive} />
            </p>
          </div>
          {!unit.isActive && (
            <p className="text-xs text-grey-500">
              รายการที่ปิดใช้งานยังถูกอ้างอิงจากข้อมูลเดิมได้ แต่เลือกใช้ใหม่ไม่ได้ —
              เปิดใช้งานกลับได้จากหน้าแก้ไข
            </p>
          )}
        </div>
      </div>
    </>
  );
}
