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
import type { Role } from "@/types/rbac";
import { PERMISSION_CATALOG, RBAC_ROLES, RESOURCE_GROUPS } from "@/lib/mock/rbac";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { RbacRolesToolbar } from "./rbac-roles-toolbar";
import { buildRbacRoleColumns } from "./rbac-roles-columns";
import { RbacRoleDetailSheet } from "./rbac-role-detail-sheet";
import { RbacDeleteDialog } from "./rbac-delete-dialog";
import { useRbacToast } from "./use-rbac-toast";
import { RbacToaster } from "./rbac-toaster";

/**
 * Client container ของโมดูล RBAC. ถือ state การค้นหา + detail/delete/toast.
 * seed มาจาก typed mock คงที่ — UI-shell ไม่ mutate รายการ (REQ-10).
 */
export function RbacRolesView() {
  const [search, setSearch] = useState("");
  const [dense, setDense] = useState(false);
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const { toasts, show, dismiss } = useRbacToast();
  const router = useRouter();

  // toast เมื่อกลับจากหน้าแก้ไขแยก (/user/rbac/edit -> /user/rbac/list?toast=...) (REQ-13.1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("toast");
    if (t) {
      show(t);
      window.history.replaceState({}, "", "/user/rbac/list");
    }
  }, [show]);

  // create / duplicate / edit = หน้าแยกทั้งหมด
  function goCreate() {
    setDetailRole(null);
    router.push("/user/rbac/create");
  }

  function goDuplicate(role: Role) {
    setDetailRole(null);
    router.push(`/user/rbac/create?from=${encodeURIComponent(role.code)}`);
  }

  function goRead(role: Role) {
    setDetailRole(null);
    router.push(`/user/rbac/read?code=${encodeURIComponent(role.code)}`);
  }

  function goEdit(role: Role) {
    setDetailRole(null);
    router.push(`/user/rbac/edit?code=${encodeURIComponent(role.code)}`);
  }

  // seed คงที่: ตาราง render จาก RBAC_ROLES เสมอ — UI-shell ไม่ mutate (REQ-10).
  // กรองผ่าน table (data = RBAC_ROLES) เพื่อให้ row selection เป็น GLOBAL
  // เหมือน user module — เลือกแล้วเปลี่ยนคำค้นยังคงเลือกอยู่.
  const columns = useMemo(
    () =>
      buildRbacRoleColumns({
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
    data: RBAC_ROLES,
    columns,
    getRowId: (r) => r.code,
    meta: { onRowClick: (role: Role) => setDetailRole(role) },
    enableRowSelection: true,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter: search },
    globalFilterFn: (row, _columnId, value) => {
      const q = String(value).trim().toLowerCase();
      if (!q) return true;
      const r = row.original;
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
      <CustomBreadcrumbs
        heading="บทบาทและสิทธิ์"
        links={[{ name: "Console" }, { name: "บทบาทและสิทธิ์" }]}
        action={
          <button
            type="button"
            onClick={goCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-control bg-grey-800 px-3 text-sm font-bold text-white transition-colors hover:bg-grey-900"
          >
            <Plus className="size-4" />
            เพิ่มบทบาทใหม่
          </button>
        }
      />

      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <RbacRolesToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
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

      <RbacRoleDetailSheet
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

      <RbacDeleteDialog
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

      <RbacToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
