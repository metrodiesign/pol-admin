"use client";

import type { ReactNode } from "react";
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TableSelectedAction } from "./table-selected-action";
import { TablePagination } from "./table-pagination";
import { TableNoData } from "./table-no-data";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  /** Total filtered rows — drives the built-in pagination. Optional when hidePagination. */
  total?: number;
  dense?: boolean;
  onDenseChange?: (v: boolean) => void;
  rowsPerPageOptions?: number[];
  selectionAction?: ReactNode;
  emptyState?: ReactNode;
  searchQuery?: string;
  /** Hide the built-in pagination footer — for consumers that render their own. */
  hidePagination?: boolean;
  /** Render the selection-action overlay bar. Default true. */
  showSelectionAction?: boolean;
  /** Left padding for the selection-overlay checkbox — match the select-column padding. */
  selectionLeadingClassName?: string;
}

export function DataTable<TData>({
  table,
  total,
  dense,
  onDenseChange,
  rowsPerPageOptions,
  selectionAction,
  emptyState,
  searchQuery,
  hidePagination,
  showSelectionAction = true,
  selectionLeadingClassName,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const numSelected = table.getSelectedRowModel().rows.length;
  const colCount = table.getAllLeafColumns().length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const onRowClick = table.options.meta?.onRowClick;

  return (
    <>
      <div className="relative overflow-x-auto">
        {showSelectionAction ? (
          <TableSelectedAction
            numSelected={numSelected}
            rowCount={table.getPrePaginationRowModel().rows.length}
            onSelectAll={(c) => table.toggleAllRowsSelected(c)}
            action={selectionAction}
            leadingClassName={selectionLeadingClassName}
          />
        ) : null}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const meta = header.column.columnDef.meta;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-auto whitespace-nowrap bg-grey-200 px-4 py-4 text-sm font-semibold text-grey-600 dark:bg-grey-900",
                        meta?.headClassName,
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="p-0">
                  {emptyState ?? <TableNoData query={searchQuery} />}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={
                    onRowClick
                      ? (e) => {
                          // คลิกในเซลล์ที่ mark ignoreRowClick (เช่น คอลัมน์ปุ่ม) ไม่เปิด/trigger row
                          if (
                            (e.target as HTMLElement).closest(
                              "[data-row-click-ignore]",
                            )
                          )
                            return;
                          onRowClick(row.original);
                        }
                      : undefined
                  }
                  className={cn(
                    "border-b border-dashed border-[var(--divider)] transition-colors",
                    onRowClick && "cursor-pointer",
                    row.getIsSelected()
                      ? "bg-[var(--action-selected)]"
                      : "hover:bg-[var(--action-hover)]",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      data-row-click-ignore={
                        cell.column.columnDef.meta?.ignoreRowClick
                          ? ""
                          : undefined
                      }
                      className={cn(
                        "px-4 align-middle",
                        dense ? "py-1.5" : "py-4",
                        // คอลัมน์ที่ไม่ trigger row → ยกเลิก cursor-pointer ของ row
                        cell.column.columnDef.meta?.ignoreRowClick &&
                          "cursor-default",
                        cell.column.columnDef.meta?.cellClassName,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hidePagination ? null : (
        <TablePagination
          page={pageIndex}
          rowsPerPage={pageSize}
          count={total ?? 0}
          onPageChange={(p) => table.setPageIndex(p)}
          onRowsPerPageChange={(r) => {
            table.setPageSize(r);
            table.setPageIndex(0);
          }}
          dense={dense}
          onDenseChange={onDenseChange}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      )}
    </>
  );
}
