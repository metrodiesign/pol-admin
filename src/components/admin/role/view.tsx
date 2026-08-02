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
import type { Role } from "@/types/admin/role";
import { getRoles, deleteRole as deleteRoleApi } from "@/lib/api/admin-api";
import { useRoleCatalog } from "@/hooks/use-role-catalog";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { toasts, show, dismiss } = useRoleToast();
  const router = useRouter();

  const cat = useRoleCatalog();
  const catalog = cat.catalog?.permissions ?? [];
  const groups = cat.catalog?.groups ?? [];
  const loading = rolesLoading || cat.loading;
  const error = rolesError || cat.error;

  // โหลด list จริงจาก backend (GET /admin/roles). guard active กัน setState หลัง unmount.
  useEffect(() => {
    let active = true;
    getRoles()
      .then((data) => {
        if (active) setRoles(data);
      })
      .catch(() => {
        if (active) setRolesError(true);
      })
      .finally(() => {
        if (active) setRolesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  // toast เมื่อกลับจากหน้าแก้ไขแยก (/user/role/edit -> /user/role/list?toast=...) (REQ-13.1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("toast");
    if (t) {
      show(t);
      window.history.replaceState({}, "", "/admin/role/list");
    }
  }, [show]);

  // create / duplicate / edit = หน้าแยกทั้งหมด
  function goCreate() {
    setDetailRole(null);
    router.push("/admin/role/create");
  }

  function goDuplicate(role: Role) {
    setDetailRole(null);
    router.push(`/admin/role/create?from=${encodeURIComponent(role.code)}`);
  }

  function goRead(role: Role) {
    setDetailRole(null);
    router.push(`/admin/role/read?code=${encodeURIComponent(role.code)}`);
  }

  function goEdit(role: Role) {
    setDetailRole(null);
    router.push(`/admin/role/edit?code=${encodeURIComponent(role.code)}`);
  }

  // ตาราง render จาก list จริง (GET /admin/roles). กรองผ่าน table (data = roles)
  // เพื่อให้ row selection เป็น GLOBAL เหมือน user module —
  // เลือกแล้วเปลี่ยนคำค้นยังคงเลือกอยู่.
  const columns = useMemo(
    () =>
      buildRoleColumns({
        catalog,
        onSelect: setDetailRole,
        onRead: goRead,
        onEdit: goEdit,
        onDuplicate: goDuplicate,
        onDelete: setDeleteRole,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers เสถียร (router/setState); rebuild เมื่อ catalog มา
    [catalog],
  );

  const table = useDataTable<Role>({
    data: roles,
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
      <CustomBreadcrumbs
        heading="บทบาทและสิทธิ์"
        links={[{ name: "Console" }, { name: "บทบาทและสิทธิ์" }]}
        action={
          <button
            type="button"
            onClick={goCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
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
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-grey-500">
            กำลังโหลด…
          </p>
        ) : error ? (
          <div className="px-5 py-10 text-center text-sm text-grey-500">
            <p>โหลดบทบาทไม่สำเร็จ</p>
            <button
              type="button"
              onClick={() => {
                setRolesLoading(true);
                setRolesError(false);
                setReloadKey((k) => k + 1);
                if (cat.error) cat.reload();
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
        catalog={catalog}
        groups={groups}
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
        onConfirm={async (role) => {
          const res = await deleteRoleApi(role.code);
          if (res.status === 409) {
            show(`ลบบทบาท “${role.name}” ไม่ได้ — มีผู้ใช้ผูกอยู่`);
            return;
          }
          if (!res.ok) {
            show(`ลบบทบาท “${role.name}” ไม่สำเร็จ`);
            return;
          }
          setDetailRole(null);
          setDeleteRole(null);
          setReloadKey((k) => k + 1); // re-fetch list หลังลบ
          show(`ลบบทบาท “${role.name}” สำเร็จ`);
        }}
      />

      <RoleToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
