"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { Division } from "@/types/organization/division";
import { DIVISION_BASE_PATH, DIVISION_LABEL } from "@/lib/organization/division/config";
import { getDivisions, deactivateDivision } from "@/lib/api/admin/division";
import { useDataTable } from "@/hooks/use-data-table";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/table/data-table";
import { Toaster } from "@/components/shared/toaster";
import { OrgUnitToolbar } from "@/components/organization/org-unit/toolbar";
import { buildOrgUnitColumns } from "@/components/organization/org-unit/columns";
import { OrgUnitConfirmDialog } from "@/components/organization/org-unit/confirm-dialog";
import { statusOf } from "@/components/organization/org-unit/status-badge";
import { DivisionDetailSheet } from "./detail-sheet";

/**
 * Client container หน้า list ของ division (โมดูลอิสระ — REQ-7.2).
 * โหลดทั้งก้อนจาก backend แล้วกรอง/เรียง/แบ่งหน้า client-side (server ไม่รองรับ filter/sort — REQ-2).
 */
export function DivisionListView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dense, setDense] = useState(false);
  const [detailUnit, setDetailUnit] = useState<Division | null>(null);
  const [deactivateUnit, setDeactivateUnit] = useState<Division | null>(null);
  const [units, setUnits] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { toasts, show, dismiss } = useToast();
  const router = useRouter();

  // โหลด list จริงจาก backend (fetch-all — REQ-2.1). guard active กัน setState หลัง unmount.
  useEffect(() => {
    let active = true;
    getDivisions()
      .then((data) => {
        if (active) setUnits(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  // toast เมื่อกลับจากหน้า create/edit (?toast=...) แล้วล้าง query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("toast");
    if (t) {
      show(t);
      window.history.replaceState({}, "", `${DIVISION_BASE_PATH}/list`);
    }
  }, [show]);

  function goRead(unit: Division) {
    setDetailUnit(null);
    router.push(`${DIVISION_BASE_PATH}/read?id=${encodeURIComponent(unit.id)}`);
  }

  function goEdit(unit: Division) {
    setDetailUnit(null);
    router.push(`${DIVISION_BASE_PATH}/edit?id=${encodeURIComponent(unit.id)}`);
  }

  // data = units เต็มก้อนแล้วกรองผ่าน globalFilterFn — row selection เป็น GLOBAL
  // (เลือกแล้วเปลี่ยนคำค้นยังคงเลือกอยู่) ตาม pattern ของ role/user module.
  const columns = useMemo(
    () =>
      buildOrgUnitColumns<Division>({
        label: DIVISION_LABEL,
        onSelect: setDetailUnit,
        onRead: goRead,
        onEdit: goEdit,
        onDeactivate: setDeactivateUnit,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers เสถียร (router/setState)
    [],
  );

  const table = useDataTable<Division>({
    data: units,
    columns,
    getRowId: (u) => u.id,
    meta: { onRowClick: (unit: Division) => setDetailUnit(unit) },
    enableRowSelection: true,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter: { search, status } },
    globalFilterFn: (row, _columnId, value) => {
      const f = value as { search: string; status: string };
      const u = row.original;
      if (f.status && statusOf(u.isActive) !== f.status) return false;
      const q = f.search.trim().toLowerCase();
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: "name", desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <OrgUnitToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            table.setPageIndex(0);
          }}
          status={status}
          onStatusChange={(v) => {
            setStatus(v);
            table.setPageIndex(0);
          }}
        />
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-grey-500">กำลังโหลด…</p>
        ) : error ? (
          <div className="px-5 py-10 text-center text-sm text-grey-500">
            <p>โหลด{DIVISION_LABEL}ไม่สำเร็จ</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(false);
                setReloadKey((k) => k + 1);
              }}
              className="mt-3 inline-flex h-9 items-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <DataTable
            table={table}
            total={filteredCount}
            dense={dense}
            onDenseChange={setDense}
            rowsPerPageOptions={[5, 10, 25]}
            searchQuery={search}
            showSelectionAction={false}
          />
        )}
        <p className="border-t border-[var(--divider)] px-5 py-4 text-xs text-grey-500">
          การปิดใช้งานไม่ลบข้อมูล — รายการที่ปิดใช้งานยังถูกอ้างอิงจากข้อมูลเดิมได้
          แต่เลือกใช้ใหม่ไม่ได้ · เปิดใช้งานกลับได้จากหน้าแก้ไข
        </p>
      </div>

      <DivisionDetailSheet
        unit={detailUnit}
        open={detailUnit !== null}
        onOpenChange={(open) => {
          if (!open) setDetailUnit(null);
        }}
        onRead={goRead}
        onEdit={goEdit}
        onDeactivate={setDeactivateUnit}
      />

      <OrgUnitConfirmDialog
        open={deactivateUnit !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateUnit(null);
        }}
        title={`ปิดใช้งาน${DIVISION_LABEL}`}
        description={
          <>
            ต้องการปิดใช้งาน &ldquo;{deactivateUnit?.name}&rdquo; ใช่หรือไม่?
            รายการจะยังถูกอ้างอิงจากข้อมูลเดิมได้ แต่เลือกใช้ใหม่ไม่ได้ —
            เปิดใช้งานกลับได้จากหน้าแก้ไข
          </>
        }
        confirmLabel="ปิดใช้งาน"
        confirmVariant="destructive"
        onConfirm={async () => {
          const unit = deactivateUnit;
          if (!unit) return;
          const res = await deactivateDivision(unit.id);
          if (!res.ok) {
            setDeactivateUnit(null);
            show(`ปิดใช้งาน "${unit.name}" ไม่สำเร็จ`);
            return;
          }
          setDetailUnit(null);
          setDeactivateUnit(null);
          setReloadKey((k) => k + 1); // re-fetch list หลังปิดใช้งาน
          show(`ปิดใช้งาน "${unit.name}" สำเร็จ`);
        }}
      />

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
