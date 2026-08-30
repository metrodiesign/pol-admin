"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { Originator } from "@/types/control/originator";
import { ORIGINATORS } from "@/lib/mock/control/originators";
import { TYPE_LABEL } from "@/lib/control/originator";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlToolbar } from "@/components/control/shared/toolbar";
import { originatorColumns } from "./columns";
import "@/types/table-meta";

export function OriginatorsView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("");
  const [type, setType] = useState("");
  const [dense, setDense] = useState(false);

  const globalFilter = useMemo(
    () => ({ search, tenant, type }),
    [search, tenant, type],
  );

  const table = useDataTable<Originator>({
    data: ORIGINATORS,
    columns: originatorColumns,
    getRowId: (o) => o.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: {
      onRowClick: (o) => router.push(`/control/originators/read?id=${o.id}`),
    },
    globalFilterFn: (row, _id, value) => {
      const f = value as { search: string; tenant: string; type: string };
      const o = row.original;
      if (f.tenant && o.merchantId !== f.tenant) return false;
      if (f.type && o.type !== f.type) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !o.code.toLowerCase().includes(q) &&
          !o.name.toLowerCase().includes(q)
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
      sorting: [{ id: "status", desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const resetPage = () => table.setPageIndex(0);

  return (
    <div className="flex flex-col gap-6">
      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <ControlToolbar
          search={{
            value: search,
            onChange: (v) => {
              setSearch(v);
              resetPage();
            },
            placeholder: "ค้นหา code, ชื่อ originator...",
          }}
          filters={[
            {
              label: "บริษัท",
              value: tenant,
              onChange: (v) => {
                setTenant(v);
                resetPage();
              },
              options: Object.entries(MERCHANT_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            },
            {
              label: "ประเภท",
              value: type,
              onChange: (v) => {
                setType(v);
                resetPage();
              },
              options: Object.entries(TYPE_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            },
          ]}
          rowsPerPage={{
            value: table.getState().pagination.pageSize,
            onChange: (n) => {
              table.setPageSize(n);
              resetPage();
            },
            options: [10, 25, 50],
          }}
        />
        <DataTable
          table={table}
          total={filteredCount}
          dense={dense}
          onDenseChange={setDense}
          rowsPerPageOptions={[10, 25, 50]}
          searchQuery={search}
          showSelectionAction={false}
        />
      </div>
    </div>
  );
}
