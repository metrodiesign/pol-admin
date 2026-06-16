"use client";

import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Agent } from "@/types/originator";

interface AgentsTableProps {
  table: TanstackTable<Agent>;
  onRowClick?: (agent: Agent) => void;
}

export function AgentsTable({ table, onRowClick }: AgentsTableProps) {
  const page = table.getState().pagination.pageIndex;
  const rowsPerPage = table.getState().pagination.pageSize;
  const total = table.getFilteredRowModel().rows.length;
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, total);
  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b-grey-200 hover:bg-transparent">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className="bg-grey-200 px-4 py-4 text-sm font-semibold text-grey-600"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="px-4 py-12 text-center text-sm text-grey-500"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => { if (onRowClick) onRowClick(row.original); }}
                  className="cursor-pointer border-b border-dashed border-[rgba(145,158,171,0.2)] transition-colors hover:bg-[var(--action-hover)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3 text-sm text-foreground"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between border-t border-dashed border-grey-200 px-5 py-3">
        <span className="text-sm text-grey-500">
          {total} รายการ
        </span>
        <div className="flex items-center gap-6 text-sm text-grey-600">
          <div className="flex items-center gap-2">
            <span>แสดง</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => {
                if (v == null) return;
                table.setPageSize(Number(v));
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-7 w-auto gap-1 border-none px-1 text-sm font-semibold text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>รายการ</span>
          </div>

          <span className="tabular-nums">
            {from}–{to} จาก {total}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={page === 0}
              onClick={() => table.setPageIndex(page - 1)}
              className="text-grey-600 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={page >= totalPages - 1}
              onClick={() => table.setPageIndex(page + 1)}
              className="text-grey-600 disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
