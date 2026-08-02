"use client";

import { useReducer } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type Table,
} from "@tanstack/react-table";
import "@/types/table-meta";
import type { Policy } from "@/types/policy";
import { POLICIES } from "@/lib/mock/policies";
import {
  matchesPolicyFilter,
  sumPremium,
  type PolicyFilter,
} from "@/lib/policy/policy";
import { cartReducer } from "@/lib/policy/cart";
import { useDataTable } from "@/hooks/use-data-table";
import { policyColumns } from "@/components/policy/table-columns";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];
export { ROWS_PER_PAGE_OPTIONS };

export interface PremiumCart {
  items: Policy[];
  count: number;
  total: number;
  has(id: string): boolean;
  /** add/remove — กันซ้ำ (REQ-4.6, 4.7); ทุกสถานะเพิ่มได้ (user: ครบทุกรายการ) */
  toggle(policy: Policy): void;
  remove(id: string): void;
  clear(): void;
  replace(items: Policy[]): void;
}

interface UsePolicyTableWithCartParams {
  globalFilter: PolicyFilter;
  /** เปิด checkout ใบเดียว (ซื้อเลย) — ส่งจาก view ที่ถือ dialog state */
  onBuyNow: (policy: Policy) => void;
}

export function usePolicyTableWithCart({
  globalFilter,
  onBuyNow,
}: UsePolicyTableWithCartParams): {
  table: Table<Policy>;
  filteredCount: number;
  cart: PremiumCart;
} {
  const [items, dispatch] = useReducer(cartReducer, []);

  const cart: PremiumCart = {
    items,
    count: items.length,
    total: sumPremium(items),
    has: (id) => items.some((i) => i.id === id),
    toggle: (policy) =>
      dispatch(
        items.some((i) => i.id === policy.id)
          ? { type: "remove", id: policy.id }
          : { type: "add", policy },
      ),
    remove: (id) => dispatch({ type: "remove", id }),
    clear: () => dispatch({ type: "clear" }),
    replace: (newItems) => dispatch({ type: "replace", items: newItems }),
  };

  const table = useDataTable<Policy>({
    data: POLICIES,
    columns: policyColumns,
    getRowId: (p) => p.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    globalFilterFn: (row, _columnId, value) =>
      matchesPolicyFilter(row.original, value),
    meta: {
      cart: {
        has: cart.has,
        toggle: cart.toggle,
        buyNow: onBuyNow,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: "vcp", desc: false }],
      pagination: { pageIndex: 0, pageSize: 25 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return { table, filteredCount, cart };
}
