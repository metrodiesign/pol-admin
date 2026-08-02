"use client";

import { Ban, Eye, Pencil, X } from "lucide-react";
import type { OrgUnit } from "@/types/organization/org-unit";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { OrgUnitStatusBadge } from "./status-badge";

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
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 p-0 sm:max-w-md">
        {unit && (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-[var(--divider)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <SheetTitle className="sr-only">
                    รายละเอียด{label} {unit.name}
                  </SheetTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-foreground">{unit.name}</span>
                    <OrgUnitStatusBadge isActive={unit.isActive} />
                  </div>
                  <span className="font-mono text-xs text-grey-500">รหัส: {unit.code}</span>
                </div>
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="ปิด"
                      className="shrink-0 text-grey-600"
                    />
                  }
                >
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

            {/* Body — field ทั้งหมดของ entity */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <div className="rounded-control border border-[var(--divider)] p-3">
                <p className="text-xs text-grey-500">รหัส</p>
                <p className="mt-1 font-mono text-sm text-foreground">{unit.code}</p>
              </div>
              <div className="rounded-control border border-[var(--divider)] p-3">
                <p className="text-xs text-grey-500">ชื่อ{label}</p>
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
