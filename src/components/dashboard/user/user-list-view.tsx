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
import { userColumns } from "./user-table-columns";

const STATUS_TABS: Array<{ label: string; value: UserStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Banned", value: "banned" },
];

function getStatusCount(users: User[], status: UserStatus | "all"): number {
  if (status === "all") return users.length;
  return users.filter((u) => u.status === status).length;
}

export function UserListView() {
  const [tab, setTab] = useState<UserStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dense, setDense] = useState(false);

  const tabCounts = useMemo(
    () =>
      STATUS_TABS.map((t) => ({ ...t, count: getStatusCount(USERS, t.value) })),
    [],
  );

  // Filter via the table (data = full USERS) so row selection stays GLOBAL —
  // selecting users then switching tab/filter keeps them selected, matching the
  // source. Pre-filtering `data` would drop selected rows out of the model.
  const globalFilter = useMemo(
    () => ({ tab, role: roleFilter, search }),
    [tab, roleFilter, search],
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
      const f = value as { tab: UserStatus | "all"; role: string; search: string };
      const u = row.original;
      if (f.tab !== "all" && u.status !== f.tab) return false;
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
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div
      className="overflow-hidden rounded-2xl bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <UserListTabs
        tabs={tabCounts}
        active={tab}
        onChange={(value) => {
          setTab(value);
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
    </div>
  );
}
