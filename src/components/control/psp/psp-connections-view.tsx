"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { PspConnection } from "@/types/psp-connection";
import { PSP_CONNECTIONS } from "@/lib/mock/psp-connections";
import { PROVIDER_LABEL } from "@/lib/control/psp";
import { MERCHANT_LABEL } from "@/lib/mock/merchants";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlListToolbar } from "@/components/control/shared/control-list-toolbar";
import { PspStatCards } from "./psp-stat-cards";
import { pspColumns } from "./psp-table-columns";
import "@/types/table-meta";

export function PspConnectionsView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("");
  const [dense, setDense] = useState(false);

  const globalFilter = useMemo(
    () => ({ search, tenant }),
    [search, tenant],
  );

  const table = useDataTable<PspConnection>({
    data: PSP_CONNECTIONS,
    columns: pspColumns,
    getRowId: (p) => p.pspConnectionId,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: { onRowClick: (p) => router.push(`/control/psp/read?id=${p.pspConnectionId}`) },
    globalFilterFn: (row, _id, value) => {
      const f = value as { search: string; tenant: string };
      const p = row.original;
      if (f.tenant && p.merchantId !== f.tenant) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !p.pspConnectionId.toLowerCase().includes(q) &&
          !PROVIDER_LABEL[p.psp].toLowerCase().includes(q)
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
      sorting: [{ id: "health", desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const resetPage = () => table.setPageIndex(0);

  return (
    <div className="flex flex-col gap-6">
      <PspStatCards rows={PSP_CONNECTIONS} />

      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <ControlListToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            resetPage();
          }}
          searchPlaceholder="ค้นหา PSP, รหัสการเชื่อมต่อ..."
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
          ]}
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
