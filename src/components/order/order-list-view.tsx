"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { OrderStatus } from "@/types/order-payment";
import { ORDER_ROWS, ORDER_STATUS_LABEL, type OrderRow } from "@/lib/order";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { OrderStatCards } from "./order-stat-cards";
import { OrderListTabs } from "./order-list-tabs";
import { OrderListToolbar } from "./order-list-toolbar";
import { OrderDetailSheet } from "./order-detail-sheet";
import { buildOrderColumns } from "./order-table-columns";
import "@/types/table-meta";

type TabValue = OrderStatus | "all";

const STATUS_ORDER: OrderStatus[] = ["AwaitingPayment", "Paid", "Cancelled"];

export function OrderListView() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [psp, setPsp] = useState("");
  const [statusTab, setStatusTab] = useState<TabValue>("all");
  const [dense, setDense] = useState(false);
  const [detailTx, setDetailTx] = useState<OrderRow | null>(null);

  const globalFilter = useMemo(
    () => ({ search, channel, psp, status: statusTab }),
    [search, channel, psp, statusTab],
  );

  const columns = useMemo(
    () =>
      buildOrderColumns({
        onSelect: setDetailTx,
        onRead: (t) => router.push(`/order/read?id=${t.session?.code ?? t.id}`),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useDataTable<OrderRow>({
    data: ORDER_ROWS,
    columns,
    getRowId: (t) => t.id,
    enableRowSelection: true,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: {
      onRowClick: setDetailTx,
    },
    globalFilterFn: (row, _columnId, value) => {
      const f = value as {
        search: string;
        channel: string;
        psp: string;
        status: TabValue;
      };
      const t = row.original;
      if (!(f.status === "all" || t.status === f.status)) return false;
      if (f.channel && t.session?.channel !== f.channel) return false;
      if (f.psp && t.session?.psp !== f.psp) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !(t.session?.code ?? t.id).toLowerCase().includes(q) &&
          !(t.session?.source.label ?? "").toLowerCase().includes(q) &&
          !(t.session?.recipientEmail ?? "").toLowerCase().includes(q)
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

  const count = (status: TabValue) =>
    status === "all"
      ? ORDER_ROWS.length
      : ORDER_ROWS.filter((t) => t.status === status).length;

  const tabs = [
    { label: "ทั้งหมด", value: "all" as TabValue, count: count("all") },
    ...STATUS_ORDER.map((s) => ({
      label: ORDER_STATUS_LABEL[s],
      value: s as TabValue,
      count: count(s),
    })),
  ];


  return (
    <>
    <div className="flex flex-col gap-6">
      <OrderStatCards />

      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <OrderListTabs
          tabs={tabs}
          active={statusTab}
          onChange={(v) => {
            setStatusTab(v);
            table.setPageIndex(0);
          }}
        />
        <OrderListToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            table.setPageIndex(0);
          }}
          channel={channel}
          onChannelChange={(v) => {
            setChannel(v);
            table.setPageIndex(0);
          }}
          psp={psp}
          onPspChange={(v) => {
            setPsp(v);
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
          rowsPerPageOptions={[10, 25, 50]}
          searchQuery={search}
          showSelectionAction={false}
        />
      </div>
    </div>

    <OrderDetailSheet
      order={detailTx}
      open={detailTx !== null}
      onOpenChange={(open) => { if (!open) setDetailTx(null); }}
      onRead={(t) => router.push(`/order/read?id=${t.session?.code ?? t.id}`)}
    />
    </>
  );
}
