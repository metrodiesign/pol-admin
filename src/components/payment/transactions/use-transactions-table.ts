"use client";

import { useState, useMemo } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
  type Table,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { Transaction, TransactionStatus } from "@/types/transaction";
import { TRANSACTIONS } from "@/lib/mock/transactions";
import { txnColumns } from "./transactions-columns";

export type TxnStatusFilter = TransactionStatus | "all";
export type TxnOriginFilter = "all" | "branch" | "staff" | "agent" | "broker" | "app";
export type TxnPspFilter = "all" | "2C2P" | "Omise";

export interface TransactionsTableState {
  table: Table<Transaction>;
  statusFilter: TxnStatusFilter;
  originFilter: TxnOriginFilter;
  pspFilter: TxnPspFilter;
  search: string;
  dateFrom: string;
  dateTo: string;
  selectedTxn: Transaction | null;
  rowSelectionCount: number;
  filteredCount: number;
  statusCounts: Record<TxnStatusFilter, number>;
  setStatusFilter: (v: TxnStatusFilter) => void;
  setOriginFilter: (v: TxnOriginFilter) => void;
  setPspFilter: (v: TxnPspFilter) => void;
  setSearch: (v: string) => void;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  setSelectedTxn: (txn: Transaction | null) => void;
  clearFilters: () => void;
}

export function useTransactionsTable(): TransactionsTableState {
  const [statusFilter, setStatusFilter] = useState<TxnStatusFilter>("all");
  const [originFilter, setOriginFilter] = useState<TxnOriginFilter>("all");
  const [pspFilter, setPspFilter] = useState<TxnPspFilter>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "ts", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const filteredData = useMemo<Transaction[]>(() => {
    return TRANSACTIONS.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (originFilter !== "all" && t.originator.type !== originFilter) return false;
      if (pspFilter !== "all" && t.psp !== pspFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const match =
          t.id.toLowerCase().includes(s) ||
          t.customer.name.toLowerCase().includes(s) ||
          t.customer.email.toLowerCase().includes(s) ||
          t.originator.name.toLowerCase().includes(s);
        if (!match) return false;
      }
      if (dateFrom) {
        const txDate = t.ts.slice(0, 10);
        if (txDate < dateFrom) return false;
      }
      if (dateTo) {
        const txDate = t.ts.slice(0, 10);
        if (txDate > dateTo) return false;
      }
      return true;
    });
  }, [statusFilter, originFilter, pspFilter, search, dateFrom, dateTo]);

  const statusCounts = useMemo<Record<TxnStatusFilter, number>>(() => {
    const base = TRANSACTIONS;
    return {
      all: base.length,
      succeeded: base.filter((t) => t.status === "succeeded").length,
      pending: base.filter((t) => t.status === "pending").length,
      processing: base.filter((t) => t.status === "processing").length,
      authorized: base.filter((t) => t.status === "authorized").length,
      failed: base.filter((t) => t.status === "failed").length,
      refunded: base.filter((t) => t.status === "refunded").length,
      voided: base.filter((t) => t.status === "voided").length,
    };
  }, []);

  const table = useDataTable<Transaction>({
    data: filteredData,
    columns: txnColumns,
    state: { sorting, rowSelection, columnFilters, pagination },
    meta: {
      onRowClick: (row: Transaction) => setSelectedTxn(row),
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    enableMultiSort: false,
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setOriginFilter("all");
    setPspFilter("all");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  return {
    table,
    statusFilter,
    originFilter,
    pspFilter,
    search,
    dateFrom,
    dateTo,
    selectedTxn,
    rowSelectionCount: Object.keys(rowSelection).length,
    filteredCount: filteredData.length,
    statusCounts,
    setStatusFilter,
    setOriginFilter,
    setPspFilter,
    setSearch,
    setDateFrom,
    setDateTo,
    setSelectedTxn,
    clearFilters,
  };
}
