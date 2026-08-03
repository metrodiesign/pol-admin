"use client";

import { Ban, Eye, Pencil, X } from "lucide-react";
import type { OrgUnit } from "@/types/organization/org-unit";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { OrgUnitStatusBadge } from "./status-badge";

const fieldLabel = "mb-1.5 block text-xs font-semibold text-grey-700";

interface OrgUnitDetailSheetProps {
  unit: OrgUnit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** label ไทยของ entity (เช่น "สำนักงาน") */
  label: string;
  onRead?: (unit: OrgUnit) => void;
  onEdit?: (unit: OrgUnit) => void;
  onDeactivate?: (unit: OrgUnit) => void;
}

/** Drawer รายละเอียด org unit จาก row click — ข้อมูลมีแค่ 3 field แสดงตรง ๆ ไม่ต้อง scroll. */
export function OrgUnitDetailSheet({
  unit,
  open,
  onOpenChange,
  label,
  onRead,
  onEdit,
  onDeactivate,
}: OrgUnitDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 p-0 data-[side=right]:sm:max-w-3xl"
      >
        {unit && (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-[var(--divider)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <SheetTitle className="text-base font-bold text-foreground">
                    รายละเอียด{label}
                  </SheetTitle>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-grey-600">
                      {label} <span className="font-mono">• {unit.id}</span>
                    </span>
                  </div>
                </div>
                <SheetClose className="flex size-9 shrink-0 items-center justify-center rounded-full text-grey-700 transition-colors hover:bg-[var(--action-hover)]">
                  <X className="size-5" />
                </SheetClose>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11 min-w-[140px]" onClick={() => onRead?.(unit)}>
                  <Eye className="size-4" />
                  ดูรายละเอียด
                </Button>
                <Button
                  className="h-11 min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => onEdit?.(unit)}
                >
                  <Pencil className="size-4" />
                  แก้ไข
                </Button>
              </div>
            </div>

            {/* Body — card เดียวกับโครง OrgUnitReadView (rounded-2xl bg-card + shadow-card) */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <section
                className="rounded-2xl bg-card"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="px-6 py-5">
                  <p className="text-base font-bold text-primary">ข้อมูล{label}</p>
                </div>
                <div className="border-t border-[var(--divider)]" />
                <div className="px-6 pt-5 pb-6">
                  <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <p className={fieldLabel}>รหัส</p>
                      <p className="text-sm font-bold text-foreground">{unit.code}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>ชื่อ{label}</p>
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
            </div>

            {/* Footer — ปุ่มปิดใช้งานเฉพาะรายการที่ยัง active (REQ-2.11) */}
            <div className="flex items-center justify-between gap-2 border-t border-[var(--divider)] p-4">
              {unit.isActive ? (
                <Button
                  variant="destructive"
                  className="h-11 min-w-[140px]"
                  onClick={() => onDeactivate?.(unit)}
                >
                  <Ban className="size-4" />
                  ปิดใช้งาน
                </Button>
              ) : (
                <span />
              )}
              <SheetClose
                render={
                  <button
                    type="button"
                    className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-control bg-[rgba(145,158,171,0.16)] px-3 text-sm font-bold text-grey-800 transition-colors hover:bg-[rgba(145,158,171,0.24)]"
                  />
                }
              >
                ปิด
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
