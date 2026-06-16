"use client";

import {
  flexRender,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Policy } from "@/types/policy";

interface PolicyDataTableProps {
  table: TanstackTable<Policy>;
  dense: boolean;
}

export function PolicyDataTable({ table, dense }: PolicyDataTableProps) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-b-grey-200 hover:bg-transparent">
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort();
              const sorted = header.column.getIsSorted();
              return (
                <TableHead
                  key={header.id}
                  className={`px-4 py-4 text-sm font-semibold text-grey-600 bg-grey-200 ${
                    header.id === "select" ? "w-12 pl-1 pr-0" : ""
                  } ${header.id === "actions" ? "w-20" : ""}`}
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="group inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sorted === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : sorted === "desc" ? (
                        <ArrowDown className="size-3.5" />
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                      )}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className={`border-b border-dashed border-[var(--divider)] transition-colors ${
              row.getIsSelected()
                ? "bg-[var(--action-selected)]"
                : "hover:bg-[var(--action-hover)]"
            }`}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={`px-4 text-sm text-foreground ${
                  dense ? "py-2" : "py-4"
                } ${cell.column.id === "select" ? "w-12 pl-1 pr-0" : ""}`}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
