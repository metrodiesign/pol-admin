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
import type { Policy, PaymentStatus } from "@/types/policy";
import { POLICIES } from "@/lib/mock/policies";
import { policyColumns } from "@/components/dashboard/policy/policy-columns";

export interface PolicyTableWithCart {
  table: Table<Policy>;
  tab: PaymentStatus | "all";
  setTab: (value: PaymentStatus | "all") => void;
  tabCounts: Array<{ label: string; value: PaymentStatus | "all"; count: number }>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  dense: boolean;
  setDense: (value: boolean) => void;
  cartItems: Policy[];
  cartTotal: number;
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  handleTabChange: (value: PaymentStatus | "all") => void;
  handlePaymentMethodChange: (value: string) => void;
  handleSearchChange: (value: string) => void;
}

const PAYMENT_TABS: Array<{ label: string; value: PaymentStatus | "all" }> = [
  { label: "ทั้งหมด", value: "all" },
  { label: "ชำระแล้ว", value: "paid" },
  { label: "ชำระบางส่วน", value: "partial" },
  { label: "ยังไม่ชำระ", value: "unpaid" },
  { label: "เกินกำหนด", value: "overdue" },
];

export function usePolicyTableWithCart(): PolicyTableWithCart {
  const [tab, setTab] = useState<PaymentStatus | "all">("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dense, setDense] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Persistent cart selection — survives tab switches
  const [cartSelection, setCartSelection] = useState<RowSelectionState>({});
  const [cartOpen, setCartOpen] = useState(false);

  const filteredByTab = useMemo(
    () =>
      tab === "all"
        ? POLICIES
        : POLICIES.filter((p) => p.paymentStatus === tab),
    [tab]
  );

  const tabCounts = useMemo(
    () =>
      PAYMENT_TABS.map((t) => ({
        ...t,
        count:
          t.value === "all"
            ? POLICIES.length
            : POLICIES.filter((p) => p.paymentStatus === t.value).length,
      })),
    []
  );

  // Project cartSelection onto visible rows for TanStack Table
  const visibleIds = useMemo(
    () => new Set(filteredByTab.map((p) => p.id)),
    [filteredByTab]
  );

  const rowSelection = useMemo(() => {
    const projected: RowSelectionState = {};
    for (const id of Object.keys(cartSelection)) {
      if (cartSelection[id] && visibleIds.has(id)) {
        projected[id] = true;
      }
    }
    return projected;
  }, [cartSelection, visibleIds]);

  // When table row selection changes, merge back into cartSelection
  const handleRowSelectionChange = useCallback(
    (updaterOrValue: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
      setCartSelection((prev) => {
        const newRowSelection =
          typeof updaterOrValue === "function"
            ? updaterOrValue(
                // Pass current projected selection as "prev" for the updater
                Object.fromEntries(
                  Object.entries(prev).filter(([id]) => visibleIds.has(id))
                )
              )
            : updaterOrValue;

        const next = { ...prev };
        // Remove deselected visible rows
        for (const id of visibleIds) {
          if (!newRowSelection[id]) {
            delete next[id];
          }
        }
        // Add selected visible rows
        for (const [id, selected] of Object.entries(newRowSelection)) {
          if (selected) {
            next[id] = true;
          }
        }
        return next;
      });
    },
    [visibleIds]
  );

  const coreRowModel = useMemo(() => getCoreRowModel(), []);
  const sortedRowModel = useMemo(() => getSortedRowModel(), []);
  const filteredRowModel = useMemo(() => getFilteredRowModel(), []);
  const paginationRowModel = useMemo(() => getPaginationRowModel(), []);
  const getRowId = useCallback((row: Policy) => row.id, []);

  const table = useDataTable({
    data: filteredByTab,
    columns: policyColumns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
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

  // Derive cart items from persistent cartSelection against full dataset
  const cartItems = useMemo(() => {
    const selectedIds = Object.keys(cartSelection).filter(
      (id) => cartSelection[id]
    );
    return POLICIES.filter((p) => selectedIds.includes(p.id));
  }, [cartSelection]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, p) => sum + p.premium, 0),
    [cartItems]
  );

  const removeFromCart = useCallback((id: string) => {
    setCartSelection((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartSelection({});
  }, []);

  const handleTabChange = useCallback(
    (value: PaymentStatus | "all") => {
      setTab(value);
      table.setPageIndex(0);
    },
    [table]
  );

  const handlePaymentMethodChange = useCallback(
    (value: string) => {
      if (value) {
        table.getColumn("paymentMethod")?.setFilterValue(value);
      } else {
        table.getColumn("paymentMethod")?.setFilterValue(undefined);
      }
      table.setPageIndex(0);
    },
    [table]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      table.setPageIndex(0);
    },
    [table]
  );

  return {
    table,
    tab,
    setTab,
    tabCounts,
    globalFilter,
    setGlobalFilter,
    dense,
    setDense,
    cartItems,
    cartTotal,
    cartCount: cartItems.length,
    cartOpen,
    setCartOpen,
    removeFromCart,
    clearCart,
    handleTabChange,
    handlePaymentMethodChange,
    handleSearchChange,
  };
}
