"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { Role } from "@/types/rbac";
import { PERMISSION_CATALOG, RBAC_ROLES, RESOURCE_GROUPS } from "@/lib/mock/rbac";
import { filterRoles } from "@/lib/rbac/role-permissions";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { RbacRolesToolbar } from "./rbac-roles-toolbar";
import { RbacRolesTable } from "./rbac-roles-table";
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
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const { toasts, show, dismiss } = useRbacToast();
  const router = useRouter();

  // toast เมื่อกลับจากหน้าแก้ไขแยก (/user/rbac/edit -> /user/rbac?toast=...) (REQ-13.1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("toast");
    if (t) {
      show(t);
      window.history.replaceState({}, "", "/user/rbac");
    }
  }, [show]);

  // seed คงที่: ตาราง render จาก RBAC_ROLES เสมอ (REQ-10.3 / 12.4).
  // ไม่มีการ mutate รายการ, ไม่เรียก network, ไม่เขียน storage (REQ-10.2) — CRUD = UI-shell.
  const roles = RBAC_ROLES;
  const filtered = useMemo(() => filterRoles(roles, search), [roles, search]);

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
        <RbacRolesToolbar search={search} onSearchChange={setSearch} />
        <RbacRolesTable
          roles={filtered}
          hasRoles={roles.length > 0}
          query={search}
          catalog={PERMISSION_CATALOG}
          onSelect={setDetailRole}
          onRead={goRead}
          onEdit={goEdit}
          onDuplicate={goDuplicate}
          onDelete={setDeleteRole}
        />
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
