"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { Transaction, TransactionStatus } from "@/types/transaction";
import { TRANSACTIONS } from "@/lib/mock/transactions";
import { STATUS_LABEL } from "@/lib/transaction";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { TransactionStatCards } from "./transaction-stat-cards";
import { TransactionListTabs } from "./transaction-list-tabs";
import { TransactionListToolbar } from "./transaction-list-toolbar";
import { transactionColumns } from "./transaction-table-columns";
import "@/types/table-meta";

type TabValue = TransactionStatus | "all";

const STATUS_ORDER: TransactionStatus[] = [
  "completed",
  "pending",
  "processing",
  "failed",
  "refunded",
  "cancelled",
];

export function TransactionListView() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [psp, setPsp] = useState("");
  const [statusTab, setStatusTab] = useState<TabValue>("all");
  const [dense, setDense] = useState(false);

  const globalFilter = useMemo(
    () => ({ search, source, psp, status: statusTab }),
    [search, source, psp, statusTab],
  );

  const table = useDataTable<Transaction>({
    data: TRANSACTIONS,
    columns: transactionColumns,
    getRowId: (t) => t.id,
    enableRowSelection: true,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: {
      onRowClick: (t) => router.push(`/transaction/read?id=${t.code}`),
    },
    globalFilterFn: (row, _columnId, value) => {
      const f = value as {
        search: string;
        source: string;
        psp: string;
        status: TabValue;
      };
      const t = row.original;
      if (!(f.status === "all" || t.status === f.status)) return false;
      if (f.source && t.source.code !== f.source) return false;
      if (f.psp && t.psp !== f.psp) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !t.code.toLowerCase().includes(q) &&
          !t.customerName.toLowerCase().includes(q) &&
          !t.customerEmail.toLowerCase().includes(q)
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
      sorting: [{ id: "time", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const filteredRows = table.getFilteredRowModel().rows.map((r) => r.original);

  const count = (status: TabValue) =>
    status === "all"
      ? TRANSACTIONS.length
      : TRANSACTIONS.filter((t) => t.status === status).length;

  const tabs = [
    { label: "ทั้งหมด", value: "all" as TabValue, count: count("all") },
    ...STATUS_ORDER.map((s) => ({
      label: STATUS_LABEL[s],
      value: s as TabValue,
      count: count(s),
    })),
  ];

  const sourceOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of TRANSACTIONS) {
      if (!seen.has(t.source.code)) seen.set(t.source.code, t.source.label);
    }
    return Array.from(seen, ([code, label]) => ({
      value: code,
      label: `${code} ${label}`,
    }));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <TransactionStatCards />

      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <TransactionListTabs
          tabs={tabs}
          active={statusTab}
          onChange={(v) => {
            setStatusTab(v);
            table.setPageIndex(0);
          }}
        />
        <TransactionListToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            table.setPageIndex(0);
          }}
          source={source}
          onSourceChange={(v) => {
            setSource(v);
            table.setPageIndex(0);
          }}
          sourceOptions={sourceOptions}
          psp={psp}
          onPspChange={(v) => {
            setPsp(v);
            table.setPageIndex(0);
          }}
          rows={filteredRows}
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
