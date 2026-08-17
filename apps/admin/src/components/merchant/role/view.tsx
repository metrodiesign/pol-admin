"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { Role } from "@/types/merchant/role";
import { PERMISSION_CATALOG, ROLES, RESOURCE_GROUPS } from "@/lib/mock/merchant/role";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { RolesToolbar } from "./toolbar";
import { buildRoleColumns } from "./columns";
import { RoleDetailSheet } from "./detail-sheet";
import { RoleDeleteDialog } from "./delete-dialog";
import { useRoleToast } from "./use-toast";
import { RoleToaster } from "./toaster";

/**
 * Client container ของโมดูล Role. ถือ state การค้นหา + detail/delete/toast.
 * seed มาจาก typed mock คงที่ — UI-shell ไม่ mutate รายการ (REQ-10).
 */
export function RolesView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dense, setDense] = useState(false);
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const { toasts, show, dismiss } = useRoleToast();
  const router = useRouter();

  // toast เมื่อกลับจากหน้าแก้ไขแยก (/merchant/role/edit -> /merchant/role/list?toast=...) (REQ-13.1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("toast");
    if (t) {
      show(t);
      window.history.replaceState({}, "", "/merchant/role/list");
    }
  }, [show]);

  // create / duplicate / edit = หน้าแยกทั้งหมด
  function goDuplicate(role: Role) {
    setDetailRole(null);
    router.push(`/merchant/role/create?from=${encodeURIComponent(role.code)}`);
  }

  function goRead(role: Role) {
    setDetailRole(null);
    router.push(`/merchant/role/read?code=${encodeURIComponent(role.code)}`);
  }

  function goEdit(role: Role) {
    setDetailRole(null);
    router.push(`/merchant/role/edit?code=${encodeURIComponent(role.code)}`);
  }

  // seed คงที่: ตาราง render จาก ROLES เสมอ — UI-shell ไม่ mutate (REQ-10).
  // กรองผ่าน table (data = ROLES) เพื่อให้ row selection เป็น GLOBAL
  // เหมือน user module — เลือกแล้วเปลี่ยนคำค้นยังคงเลือกอยู่.
  const columns = useMemo(
    () =>
      buildRoleColumns({
        catalog: PERMISSION_CATALOG,
        onSelect: setDetailRole,
        onRead: goRead,
        onEdit: goEdit,
        onDuplicate: goDuplicate,
        onDelete: setDeleteRole,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers เสถียร (router/setState)
    [],
  );

  const table = useDataTable<Role>({
    data: ROLES,
    columns,
    getRowId: (r) => r.code,
    meta: { onRowClick: (role: Role) => setDetailRole(role) },
    enableRowSelection: true,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter: { search, status } },
    globalFilterFn: (row, _columnId, value) => {
      const f = value as { search: string; status: string };
      const r = row.original;
      if (f.status && r.status !== f.status) return false;
      const q = f.search.trim().toLowerCase();
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: "name", desc: false }],
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <RolesToolbar
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
        <DataTable
          table={table}
          total={filteredCount}
          dense={dense}
          onDenseChange={setDense}
          rowsPerPageOptions={[5, 10, 25]}
          searchQuery={search}
          showSelectionAction={false}
        />
        <p className="border-t border-[var(--divider)] px-5 py-4 text-xs text-grey-500">
          สิทธิ์รวมของผู้ใช้ = union ของสิทธิ์จากทุกบทบาทที่ได้รับ ·
          บทบาทที่มีผู้ใช้ผูกอยู่จะลบไม่ได้
        </p>
      </div>

      <RoleDetailSheet
        role={detailRole}
        open={detailRole !== null}
        onOpenChange={(open) => {
          if (!open) setDetailRole(null);
        }}
        catalog={PERMISSION_CATALOG}
        groups={RESOURCE_GROUPS}
        onEdit={goEdit}
        onDuplicate={goDuplicate}
        onDelete={setDeleteRole}
      />

      <RoleDeleteDialog
        role={deleteRole}
        open={deleteRole !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteRole(null);
        }}
        onConfirm={(role) => {
          // UI-shell: ปิด drawer ที่เปิดอยู่ (REQ-9.1) + toast — ไม่ลบออกจากรายการจริง (REQ-10.2)
          setDetailRole(null);
          show(`ลบบทบาท “${role.name}” สำเร็จ`);
        }}
      />

      <RoleToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
