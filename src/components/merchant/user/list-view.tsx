"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { MerchantUser, MerchantUserStatus } from "@/types/merchant/user";
import { MERCHANT_USERS } from "@/lib/mock/merchant/users";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { MerchantUserListTabs } from "./list-tabs";
import { MerchantUserListToolbar } from "./list-toolbar";
import { merchantUserColumns, statusLabel } from "./table-columns";

type TabValue = MerchantUserStatus | "all";

const STATUS_ORDER: MerchantUserStatus[] = [
  "Active",
  "PendingApproval",
  "Rejected",
  "Suspended",
];

export function MerchantUserListView() {
  const [search, setSearch] = useState("");
  const [personType, setPersonType] = useState("");
  const [statusTab, setStatusTab] = useState<TabValue>("all");
  const [dense, setDense] = useState(false);

  // Filter via the table (data = full MERCHANT_USERS) so row selection stays GLOBAL —
  // selecting rows then switching filter keeps them selected (mirrors user list).
  const globalFilter = useMemo(
    () => ({ personType, search, status: statusTab }),
    [personType, search, statusTab],
  );

  const table = useDataTable<MerchantUser>({
    data: MERCHANT_USERS,
    columns: merchantUserColumns,
    getRowId: (p) => p.id,
    enableRowSelection: true,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    globalFilterFn: (row, _columnId, value) => {
      const f = value as { personType: string; search: string; status: TabValue };
      const p = row.original;
      if (!(f.status === "all" || p.status === f.status)) return false;
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
      pagination: { pageIndex: 0, pageSize: 25 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  const count = (status: TabValue) =>
    status === "all"
      ? MERCHANT_USERS.length
      : MERCHANT_USERS.filter((p) => p.status === status).length;

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
      <MerchantUserListTabs
        tabs={tabs}
        active={statusTab}
        onChange={(v) => {
          setStatusTab(v);
          table.setPageIndex(0);
        }}
      />
      <MerchantUserListToolbar
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
