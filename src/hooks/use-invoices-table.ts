"use client";

import { useState, useMemo, useCallback } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type RowSelectionState,
  type ColumnFiltersState,
  type PaginationState,
  type Table,
} from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import type { PaymentChannel } from "@/types/transaction";
import { INVOICES } from "@/lib/mock/invoices";
import { buildInvoiceColumns } from "@/components/payment/invoices/invoice-columns";

export type InvoiceTabKey = InvoiceStatus | "all";

export interface InvoiceTabCount {
  label: string;
  value: InvoiceTabKey;
  count: number;
}

const TAB_DEFS: Array<{ label: string; value: InvoiceTabKey }> = [
  { label: "ทั้งหมด", value: "all" },
  { label: "ฉบับร่าง", value: "draft" },
  { label: "รอชำระ", value: "pending" },
  { label: "ชำระบางส่วน", value: "partial" },
  { label: "ชำระแล้ว", value: "paid" },
  { label: "เกินกำหนด", value: "overdue" },
  { label: "ลิงก์หมดอายุ", value: "expired" },
  { label: "ยกเลิก", value: "voided" },
];

export interface UseInvoicesTable {
  table: Table<Invoice>;
  tab: InvoiceTabKey;
  tabCounts: InvoiceTabCount[];
  globalFilter: string;
  channelFilter: PaymentChannel | "all";
  selectedInvoice: Invoice | null;
  drawerOpen: boolean;
  handleTabChange: (v: InvoiceTabKey) => void;
  handleSearchChange: (v: string) => void;
  handleChannelFilterChange: (v: PaymentChannel | "all") => void;
  handleRowClick: (inv: Invoice) => void;
  handleDrawerOpenChange: (open: boolean) => void;
  handleCopyLink: (inv: Invoice) => void;
  allInvoices: Invoice[];
}

export function useInvoicesTable(): UseInvoicesTable {
  const [tab, setTab] = useState<InvoiceTabKey>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState<PaymentChannel | "all">("all");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredByTab = useMemo(() => {
    let base = tab === "all" ? INVOICES : INVOICES.filter((i) => i.status === tab);
    if (channelFilter !== "all") {
      base = base.filter((i) => i.channel === channelFilter);
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      base = base.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.customer.name.toLowerCase().includes(q) ||
          i.refs.some((r) => r.toLowerCase().includes(q)),
      );
    }
    return base;
  }, [tab, channelFilter, globalFilter]);

  const tabCounts = useMemo(
    () =>
      TAB_DEFS.map((t) => ({
        ...t,
        count:
          t.value === "all"
            ? INVOICES.length
            : INVOICES.filter((i) => i.status === t.value).length,
      })),
    [],
  );

  const handleRowClick = useCallback((inv: Invoice) => {
    setSelectedInvoice(inv);
    setDrawerOpen(true);
  }, []);

  const handleCopyLink = useCallback(async (inv: Invoice) => {
    try {
      await navigator.clipboard.writeText(inv.url);
    } catch {
      // silent
    }
  }, []);

  const columns = useMemo(
    () => buildInvoiceColumns(handleRowClick, handleCopyLink),
    [handleRowClick, handleCopyLink],
  );

  const coreRowModel = useMemo(() => getCoreRowModel(), []);
  const sortedRowModel = useMemo(() => getSortedRowModel(), []);
  const filteredRowModel = useMemo(() => getFilteredRowModel(), []);
  const paginationRowModel = useMemo(() => getPaginationRowModel(), []);
  const getRowId = useCallback((row: Invoice) => row.id, []);

  const table = useDataTable({
    data: filteredByTab,
    columns,
    meta: { onRowClick: handleRowClick },
    state: {
      sorting,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
    getFilteredRowModel: filteredRowModel,
    getPaginationRowModel: paginationRowModel,
    getRowId,
  });

  const handleTabChange = useCallback(
    (value: InvoiceTabKey) => {
      setTab(value);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleChannelFilterChange = useCallback(
    (value: PaymentChannel | "all") => {
      setChannelFilter(value);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedInvoice(null);
  }, []);

  return {
    table,
    tab,
    tabCounts,
    globalFilter,
    channelFilter,
    selectedInvoice,
    drawerOpen,
    handleTabChange,
    handleSearchChange,
    handleChannelFilterChange,
    handleRowClick,
    handleDrawerOpenChange,
    handleCopyLink,
    allInvoices: INVOICES,
  };
}
