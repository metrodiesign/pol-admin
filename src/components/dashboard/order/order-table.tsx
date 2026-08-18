"use client";

import type { Order } from "@/types/order";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderTableRow } from "./order-table-row";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type SortKey = "orderNumber" | "customer" | "date" | "items" | "price" | "status";
type SortDir = "asc" | "desc";

interface OrderTableProps {
  orders: Order[];
  selected: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  dense: boolean;
  allSelected: boolean;
  someSelected: boolean;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
}

const COLUMNS: Array<{ key: SortKey; label: string; align?: string }> = [
  { key: "orderNumber", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Date" },
  { key: "items", label: "Items" },
  { key: "price", label: "Price" },
  { key: "status", label: "Status" },
];

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (column !== sortKey)
    return (
      <ArrowUpDown className="size-3.5 opacity-0 transition-opacity group-hover:opacity-40" />
    );
  return sortDir === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

export function OrderTable({
  orders,
  selected,
  onSelectAll,
  onSelectOne,
  sortKey,
  sortDir,
  onSort,
  dense,
  allSelected,
  someSelected,
  expanded,
  onToggleExpand,
}: OrderTableProps) {
  const headBg = "bg-grey-200";

  return (
    <Table>
      <TableHeader>
        <TableRow
          className={`border-b border-dashed border-[var(--divider)] hover:bg-transparent ${headBg}`}
        >
          <TableHead className={`w-12 pl-1 pr-0 leading-6 ${headBg}`}>
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={onSelectAll}
              aria-label="Select all"
            />
          </TableHead>
          {COLUMNS.map((col) => (
            <TableHead
              key={col.key}
              className={`px-4 py-4 text-sm font-semibold leading-6 text-grey-600 ${headBg}`}
            >
              <button
                type="button"
                onClick={() => onSort(col.key)}
                className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                {col.label}
                <SortIcon
                  column={col.key}
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </button>
            </TableHead>
          ))}
          <TableHead className={`w-20 ${headBg}`} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <td
              colSpan={8}
              className="py-16 text-center text-sm text-grey-600"
            >
              No data
            </td>
          </TableRow>
        ) : (
          orders.map((order) => (
            <OrderTableRow
              key={order.id}
              order={order}
              selected={selected.has(order.id)}
              onSelect={(checked) => onSelectOne(order.id, checked)}
              dense={dense}
              expanded={expanded.has(order.id)}
              onToggleExpand={() => onToggleExpand(order.id)}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
