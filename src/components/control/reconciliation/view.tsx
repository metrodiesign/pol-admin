"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { RECONCILIATION_LINES } from "@/lib/mock/control/reconciliation";
import { ORDER_STATUS_LABEL } from "@/lib/order";
import { formatTHB } from "@/lib/utils";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { StatCard } from "@/components/control/shared/stat-card";
import { cardStyle } from "@/components/control/shared/styles";
import { ControlToolbar } from "@/components/control/shared/toolbar";
import { reconciliationColumns } from "./columns";
import "@/types/table-meta";

export function ReconciliationView() {
  const lines = RECONCILIATION_LINES;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dense, setDense] = useState(false);

  const totalOrders = lines.reduce((sum, l) => sum + l.count, 0);
  const totalAmount = lines.reduce((sum, l) => sum + l.total, 0);

  const globalFilter = useMemo(() => ({ search, status }), [search, status]);

  const table = useDataTable<(typeof lines)[number]>({
    data: lines,
    columns: reconciliationColumns,
    getRowId: (l) => `${l.status}-${l.currency}`,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    globalFilterFn: (row, _id, value) => {
      const f = value as { search: string; status: string };
      const l = row.original;
      if (f.status && l.status !== f.status) return false;
      if (f.search && !l.currency.toLowerCase().includes(f.search.toLowerCase()))
        return false;
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <StatCard label="ออเดอร์ทั้งหมด" value={String(totalOrders)} />
        <StatCard label="ยอดรวม" value={formatTHB(totalAmount, 2)} />
      </div>

      <div className="rounded-card bg-card p-6" style={cardStyle}>
        <p className="text-xs text-grey-600">
          เงินจาก PSP เข้าบัญชีบริษัทโดยตรง — แพลตฟอร์มติดตามสถานะออเดอร์
          ไม่ถือเงิน สรุปนี้จัดกลุ่มตามสถานะและสกุลเงิน
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
            placeholder: "ค้นหาสกุลเงิน...",
          }}
          filters={[
            {
              label: "สถานะ",
              value: status,
              onChange: (v) => {
                setStatus(v);
                resetPage();
              },
              options: Object.entries(ORDER_STATUS_LABEL).map(
                ([value, label]) => ({ value, label }),
              ),
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
