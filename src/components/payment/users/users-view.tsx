"use client";

import { useUsersTable } from "./use-users-table";
import { UserStatCards } from "./user-stat-cards";
import { UserFilterBar } from "./user-filter-bar";
import { UserDrawer } from "./user-drawer";
import { UsersTableFooter } from "./users-table-footer";
import { DataTable } from "@/components/table/data-table";
import { PaymentTableEmpty } from "@/components/payment/table-empty";
import { ConfirmModal } from "@/components/payment/confirm-modal";
import { useToast } from "@/components/payment/toast/toast-provider";
import type { User } from "@/types/user";
import type { Role } from "@/types/role";
import type { Permission } from "@/types/permission";

interface UsersViewProps {
  initialUsers: User[];
  roles: Role[];
  permissions: Permission[];
}

export function UsersView({ initialUsers, roles, permissions }: UsersViewProps) {
  const toast = useToast();
  const {
    table,
    tab,
    portal,
    search,
    setTab,
    setPortal,
    setSearch,
    clearFilters,
    counts,
    adminCount,
    merchantCount,
    totalUsers,
    filteredCount,
    rowSelectionCount,
    selectedUser,
    drawerOpen,
    setDrawerOpen,
    setSelectedUser,
    confirmOpen,
    confirmConfig,
    setConfirmOpen,
    updateUser,
    bulkApprove,
  } = useUsersTable(initialUsers, roles);

  return (
    <div className="flex flex-col gap-4">
      {/* KPI cards */}
      <UserStatCards
        total={totalUsers}
        adminCount={adminCount}
        merchantCount={merchantCount}
        pendingCount={counts.pending}
        activeCount={counts.active}
        disabledCount={counts.disabled}
      />

      {/* Table card */}
      <div
        className="rounded-[16px] bg-bg-paper"
        style={{
          boxShadow:
            "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
        }}
      >
        <UserFilterBar
          tab={tab}
          portal={portal}
          search={search}
          counts={counts}
          selectedCount={rowSelectionCount}
          onTabChange={setTab}
          onPortalChange={setPortal}
          onSearchChange={setSearch}
          onBulkApprove={bulkApprove}
          onBulkEmail={() => {}}
          onClearSelection={() => table.resetRowSelection()}
          onExport={() => {}}
          onInvite={() => {}}
        />

        <DataTable
          table={table}
          hidePagination
          showSelectionAction={false}
          emptyState={
            <PaymentTableEmpty
              title="ไม่พบผู้ใช้งาน"
              description="ลองล้างตัวกรองหรือเปลี่ยนคำค้นเพื่อดูผลลัพธ์มากขึ้น"
              onClear={clearFilters}
            />
          }
        />

        <UsersTableFooter table={table} totalFiltered={filteredCount} />
      </div>

      {/* Drawer */}
      <UserDrawer
        user={selectedUser}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedUser(null);
        }}
        onSave={(patch) => {
          if (selectedUser) {
            updateUser(selectedUser.id, patch);
            setSelectedUser({ ...selectedUser, ...patch });
            toast.success("บันทึก Role ผู้ใช้แล้ว");
          }
        }}
        roles={roles}
        permissions={permissions}
      />

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        destructive={confirmConfig.destructive}
        confirmLabel={confirmConfig.destructive ? "ยืนยัน" : "ตกลง"}
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
