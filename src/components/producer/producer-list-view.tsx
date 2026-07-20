"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { MerchantUser } from "@/types/merchant-user";
import { MERCHANT_USERS } from "@/lib/mock/merchant-users";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ProducerListToolbar } from "./producer-list-toolbar";
import { producerColumns } from "./producer-table-columns";

export function ProducerListView() {
  const [search, setSearch] = useState("");
  const [personType, setPersonType] = useState("");
  const [dense, setDense] = useState(false);

  // Filter via the table (data = full PRODUCERS) so row selection stays GLOBAL —
  // selecting rows then switching filter keeps them selected (mirrors user list).
  const globalFilter = useMemo(
    () => ({ personType, search }),
    [personType, search],
  );

  const table = useDataTable<MerchantUser>({
    data: MERCHANT_USERS,
    columns: producerColumns,
    getRowId: (p) => p.id,
    enableRowSelection: true,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    globalFilterFn: (row, _columnId, value) => {
      const f = value as { personType: string; search: string };
      const p = row.original;
      if (f.personType && p.personType !== f.personType) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        const name = `${p.firstName} ${p.lastName}`.toLowerCase();
        if (!name.includes(q) && !p.email.toLowerCase().includes(q)) return false;
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
      <ProducerListToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          table.setPageIndex(0);
        }}
        personType={personType}
        onPersonTypeChange={(v) => {
          setPersonType(v);
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
