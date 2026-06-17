"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { User } from "@/types/user";
import { USERS } from "@/lib/mock/users";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { UserListToolbar } from "./user-list-toolbar";
import { userColumns } from "./user-table-columns";

export function UserListView() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dense, setDense] = useState(false);

  // Filter via the table (data = full USERS) so row selection stays GLOBAL —
  // selecting users then switching filter keeps them selected, matching the
  // source. Pre-filtering `data` would drop selected rows out of the model.
  const globalFilter = useMemo(
    () => ({ role: roleFilter, search }),
    [roleFilter, search],
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
      const f = value as { role: string; search: string };
      const u = row.original;
      if (f.role && u.role !== f.role) return false;
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
