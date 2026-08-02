"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { OrgUnit } from "@/types/organization/org-unit";
import type { OrgUnitConfig } from "@/lib/organization/org-unit/config";
import { getOrgUnits, deactivateOrgUnit } from "@/lib/api/admin/org-unit";
import { useDataTable } from "@/hooks/use-data-table";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/table/data-table";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { Toaster } from "@/components/shared/toaster";
import { OrgUnitToolbar } from "./toolbar";
import { buildOrgUnitColumns } from "./columns";
import { OrgUnitDetailSheet } from "./detail-sheet";
import { OrgUnitConfirmDialog } from "./confirm-dialog";
import { statusOf } from "./status-badge";

interface OrgUnitListViewProps {
  config: OrgUnitConfig;
}

/**
 * Client container หน้า list ของ org unit — ชุดเดียวใช้ร่วม 4 module ผ่าน config (REQ-7.2).
 * โหลดทั้งก้อนจาก backend แล้วกรอง/เรียง/แบ่งหน้า client-side (server ไม่รองรับ filter/sort — REQ-2).
 */
export function OrgUnitListView({ config }: OrgUnitListViewProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dense, setDense] = useState(false);
  const [detailUnit, setDetailUnit] = useState<OrgUnit | null>(null);
  const [deactivateUnit, setDeactivateUnit] = useState<OrgUnit | null>(null);
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { toasts, show, dismiss } = useToast();
  const router = useRouter();

  // โหลด list จริงจาก backend (fetch-all — REQ-2.1). guard active กัน setState หลัง unmount.
  useEffect(() => {
    let active = true;
    getOrgUnits(config.segment)
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
  }, [config.segment, reloadKey]);

  // toast เมื่อกลับจากหน้า create/edit (?toast=...) แล้วล้าง query — path จาก config ห้าม hardcode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("toast");
    if (t) {
      show(t);
      window.history.replaceState({}, "", `${config.basePath}/list`);
    }
  }, [show, config.basePath]);

  function goCreate() {
    setDetailUnit(null);
    router.push(`${config.basePath}/create`);
  }

  function goRead(unit: OrgUnit) {
    setDetailUnit(null);
    router.push(`${config.basePath}/read?id=${encodeURIComponent(unit.id)}`);
  }

  function goEdit(unit: OrgUnit) {
    setDetailUnit(null);
    router.push(`${config.basePath}/edit?id=${encodeURIComponent(unit.id)}`);
  }

  // data = units เต็มก้อนแล้วกรองผ่าน globalFilterFn — row selection เป็น GLOBAL
  // (เลือกแล้วเปลี่ยนคำค้นยังคงเลือกอยู่) ตาม pattern ของ role/user module.
  const columns = useMemo(
    () =>
      buildOrgUnitColumns({
        label: config.label,
        onSelect: setDetailUnit,
        onRead: goRead,
        onEdit: goEdit,
        onDeactivate: setDeactivateUnit,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers เสถียร (router/setState); rebuild เมื่อ config เปลี่ยน
    [config],
  );

  const table = useDataTable<OrgUnit>({
    data: units,
    columns,
    getRowId: (u) => u.id,
    meta: { onRowClick: (unit: OrgUnit) => setDetailUnit(unit) },
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
      <CustomBreadcrumbs
        heading={config.label}
        links={[{ name: "Console" }, { name: config.label }]}
        action={
          <button
            type="button"
            onClick={goCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            เพิ่ม{config.label}
          </button>
        }
      />

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
            <p>โหลด{config.label}ไม่สำเร็จ</p>
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

      <OrgUnitDetailSheet
        unit={detailUnit}
        open={detailUnit !== null}
        onOpenChange={(open) => {
          if (!open) setDetailUnit(null);
        }}
        label={config.label}
        onRead={goRead}
        onEdit={goEdit}
        onDeactivate={setDeactivateUnit}
      />

      <OrgUnitConfirmDialog
        open={deactivateUnit !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateUnit(null);
        }}
        title={`ปิดใช้งาน${config.label}`}
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
          const res = await deactivateOrgUnit(config.segment, unit.id);
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
