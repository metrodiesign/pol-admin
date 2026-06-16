"use client";

import type { Table } from "@tanstack/react-table";
import type { Invoice } from "@/types/invoice";
import type { PaymentChannel } from "@/types/transaction";
import { InvoiceListTabs, type InvoiceTabKey } from "./invoice-list-tabs";
import { InvoiceListToolbar } from "./invoice-list-toolbar";
import { DataTable } from "@/components/table/data-table";
import { InvoiceTableFooter } from "./invoice-table-footer";
import type { InvoiceTabCount } from "@/hooks/use-invoices-table";

interface InvoiceListViewProps {
  table: Table<Invoice>;
  tab: InvoiceTabKey;
  tabCounts: InvoiceTabCount[];
  globalFilter: string;
  channelFilter: PaymentChannel | "all";
  onTabChange: (v: InvoiceTabKey) => void;
  onSearchChange: (v: string) => void;
  onChannelFilterChange: (v: PaymentChannel | "all") => void;
}

export function InvoiceListView({
  table,
  tab,
  tabCounts,
  globalFilter,
  channelFilter,
  onTabChange,
  onSearchChange,
  onChannelFilterChange,
}: InvoiceListViewProps) {
  return (
    <div
      className="rounded-[16px] bg-card"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      <InvoiceListTabs tabs={tabCounts} active={tab} onChange={onTabChange} />
      <InvoiceListToolbar
        search={globalFilter}
        onSearchChange={onSearchChange}
        channelFilter={channelFilter}
        onChannelFilterChange={onChannelFilterChange}
      />
      <DataTable
        table={table}
        hidePagination
        showSelectionAction={false}
        emptyState={
          <div className="py-16 text-center text-sm text-grey-500">
            ไม่พบใบแจ้งหนี้
          </div>
        }
      />
      <InvoiceTableFooter
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
