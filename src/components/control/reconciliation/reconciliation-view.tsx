"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { RECONCILIATION_LINES } from "@/lib/mock/reconciliation";
import { ORDER_STATUS_LABEL } from "@/lib/order";
import { formatTHB } from "@/lib/utils";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlListToolbar } from "@/components/control/shared/control-list-toolbar";
import { reconciliationColumns } from "./reconciliation-columns";
import "@/types/table-meta";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-sm font-semibold text-grey-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
        {value}
      </p>
    </div>
  );
}

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

      <div
        className="rounded-2xl bg-card p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-xs text-grey-600">
          เงินจาก PSP เข้าบัญชีบริษัทโดยตรง — แพลตฟอร์มติดตามสถานะออเดอร์
          ไม่ถือเงิน สรุปนี้จัดกลุ่มตามสถานะและสกุลเงิน
        </p>
      </div>

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
          searchPlaceholder="ค้นหาสกุลเงิน..."
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
