"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { User, UserStatus } from "@/types/user";
import { USERS } from "@/lib/mock/users";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { UserListTabs } from "./user-list-tabs";
import { UserListToolbar } from "./user-list-toolbar";
import { userColumns, statusLabel } from "./user-table-columns";

type TabValue = UserStatus | "all";

const STATUS_ORDER: UserStatus[] = ["active", "banned"];

export function UserListView() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusTab, setStatusTab] = useState<TabValue>("all");
  const [dense, setDense] = useState(false);

  // Filter via the table (data = full USERS) so row selection stays GLOBAL —
  // selecting users then switching filter keeps them selected, matching the
  // source. Pre-filtering `data` would drop selected rows out of the model.
  const globalFilter = useMemo(
    () => ({ role: roleFilter, search, status: statusTab }),
    [roleFilter, search, statusTab],
  );

  const table = useDataTable<User>({
    data: USERS,
    columns: userColumns,
    getRowId: (u) => u.id,
    enableRowSelection: true,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    globalFilterFn: (row, _columnId, value) => {
      const f = value as { role: string; search: string; status: TabValue };
      const u = row.original;
      if (!(f.status === "all" || u.status === f.status)) return false;
      if (f.role && !u.roles.includes(f.role)) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: "name", desc: false }],
      pagination: { pageIndex: 0, pageSize: 25 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  const count = (status: TabValue) =>
    status === "all"
      ? USERS.length
      : USERS.filter((u) => u.status === status).length;

  const tabs = [
    { label: "ทั้งหมด", value: "all" as TabValue, count: count("all") },
    ...STATUS_ORDER.map((s) => ({
      label: statusLabel[s],
      value: s as TabValue,
      count: count(s),
    })),
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <UserListTabs
        tabs={tabs}
        active={statusTab}
        onChange={(v) => {
          setStatusTab(v);
          table.setPageIndex(0);
        }}
      />
      <UserListToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          table.setPageIndex(0);
        }}
        role={roleFilter}
        onRoleChange={(v) => {
          setRoleFilter(v);
          table.setPageIndex(0);
        }}
        status={statusTab === "all" ? "" : statusTab}
        onStatusChange={(v) => {
          setStatusTab((v || "all") as TabValue);
          table.setPageIndex(0);
        }}
        rowsPerPage={table.getState().pagination.pageSize}
        onRowsPerPageChange={(n) => {
          table.setPageSize(n);
          table.setPageIndex(0);
        }}
      />
      <DataTable
        table={table}
        total={filteredCount}
        dense={dense}
        onDenseChange={setDense}
        rowsPerPageOptions={[25, 50, 100]}
        searchQuery={search}
        showSelectionAction={false}
      />
    </div>
  );
}
