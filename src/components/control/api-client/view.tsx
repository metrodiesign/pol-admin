"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { ApiClient } from "@/types/control/api-client";
import { useControlStore } from "@/lib/control/store";
import { apiClientsStore } from "@/lib/control/api-clients-store";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlListToolbar } from "@/components/control/shared/list-toolbar";
import { ApiClientStatCards } from "./stat-cards";
import { apiClientColumns } from "./columns";
import "@/types/table-meta";

export function ApiClientsView() {
  const router = useRouter();
  const clients = useControlStore(apiClientsStore);
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("");
  const [status, setStatus] = useState("");
  const [dense, setDense] = useState(false);

  const globalFilter = useMemo(
    () => ({ search, tenant, status }),
    [search, tenant, status],
  );

  const table = useDataTable<ApiClient>({
    data: clients,
    columns: apiClientColumns,
    getRowId: (c) => c.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: {
      onRowClick: (c) => router.push(`/control/api-clients/read?id=${c.id}`),
    },
    globalFilterFn: (row, _id, value) => {
      const f = value as { search: string; tenant: string; status: string };
      const c = row.original;
      if (f.tenant && c.merchantId !== f.tenant) return false;
      if (f.status && c.status !== f.status) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !c.clientId.toLowerCase().includes(q) &&
          !c.name.toLowerCase().includes(q)
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
      <ApiClientStatCards rows={clients} />

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
          searchPlaceholder="ค้นหาชื่อ, client ID..."
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
              label: "สถานะ",
              value: status,
              onChange: (v) => {
                setStatus(v);
                resetPage();
              },
              options: [
                { value: "active", label: "ใช้งาน" },
                { value: "revoked", label: "เพิกถอนแล้ว" },
              ],
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
