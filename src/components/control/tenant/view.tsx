"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ShieldAlert } from "lucide-react";
import type { Merchant } from "@/types/merchant";
import { MERCHANTS } from "@/lib/mock/merchant";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlToolbar } from "@/components/control/shared/toolbar";
import { tenantColumns } from "./columns";
import "@/types/table-meta";

export function TenantsView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dense, setDense] = useState(false);

  const globalFilter = useMemo(() => ({ search }), [search]);

  const table = useDataTable<Merchant>({
    data: MERCHANTS,
    columns: tenantColumns,
    getRowId: (t) => t.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: { onRowClick: (t) => router.push(`/control/tenants/read?id=${t.code}`) },
    globalFilterFn: (row, _id, value) => {
      const f = value as { search: string };
      const t = row.original;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !t.code.toLowerCase().includes(q) &&
          !t.name.toLowerCase().includes(q)
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
      sorting: [{ id: "code", desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const resetPage = () => table.setPageIndex(0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/16 p-4">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-dark" />
        <p className="text-sm text-grey-700">
          เฉพาะผู้ดูแลระดับ Super เท่านั้นที่จัดการได้ — ผู้ดูแลแบบ Scoped
          เห็นเฉพาะบริษัทของตน (อ่านอย่างเดียว)
        </p>
      </div>

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
            placeholder: "ค้นหารหัส, ชื่อบริษัท...",
          }}
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
