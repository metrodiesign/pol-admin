"use client";

import type { Table } from "@tanstack/react-table";
import type { Policy, PaymentStatus } from "@/types/policy";
import { PolicyListTabs } from "./policy-list-tabs";
import { PolicyListToolbar } from "./policy-list-toolbar";
import { PolicyDataTable } from "./policy-data-table";
import { PolicyTableFooter } from "./policy-table-footer";

interface PolicyListViewProps {
  table: Table<Policy>;
  tab: PaymentStatus | "all";
  tabCounts: Array<{ label: string; value: PaymentStatus | "all"; count: number }>;
  globalFilter: string;
  dense: boolean;
  setDense: (v: boolean) => void;
  handleTabChange: (value: PaymentStatus | "all") => void;
  handlePaymentMethodChange: (value: string) => void;
  handleSearchChange: (value: string) => void;
}

export function PolicyListView({
  table,
  tab,
  tabCounts,
  globalFilter,
  dense,
  setDense,
  handleTabChange,
  handlePaymentMethodChange,
  handleSearchChange,
}: PolicyListViewProps) {
  return (
    <div
      className="rounded-[16px] bg-card"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      <PolicyListTabs
        tabs={tabCounts}
        active={tab}
        onChange={handleTabChange}
      />
      <PolicyListToolbar
        search={globalFilter}
        onSearchChange={handleSearchChange}
        paymentMethod={
          (table.getColumn("paymentMethod")?.getFilterValue() as string) ?? ""
        }
        onPaymentMethodChange={handlePaymentMethodChange}
      />
      <PolicyDataTable table={table} dense={dense} />
      <PolicyTableFooter
        dense={dense}
        onDenseChange={setDense}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        total={table.getFilteredRowModel().rows.length}
        onPageChange={(p) => table.setPageIndex(p)}
        onRowsPerPageChange={(size) => {
          table.setPageSize(size);
          table.setPageIndex(0);
        }}
      />
    </div>
  );
}
