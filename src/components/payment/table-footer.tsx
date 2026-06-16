"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Table as TanstackTable } from "@tanstack/react-table";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface PaginationFooterShellProps {
  from: number;
  to: number;
  total: number;
  pageSize: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
  entityLabel: string;
}

/** Internal visual shell — single source of truth for all pagination footers. */
export function PaginationFooterShell({
  from,
  to,
  total,
  pageSize,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onPageSizeChange,
  entityLabel,
}: PaginationFooterShellProps) {
  return (
    <div className="flex items-center justify-between border-t border-dashed border-grey-200 px-5 py-3 dark:border-grey-800">
      <p className="text-sm text-grey-500">
        รวม {total} {entityLabel}
      </p>
      <div className="flex items-center gap-5 text-sm text-grey-600">
        <div className="flex items-center gap-2">
          <span>แถวต่อหน้า:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-7 w-auto gap-1 border-none px-1 text-sm font-semibold text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="tabular-nums">
          {from}–{to} จาก {total}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!canPrev}
            onClick={onPrev}
            className="text-grey-600 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!canNext}
            onClick={onNext}
            className="text-grey-600 disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TableFooterProps<T> {
  table: TanstackTable<T>;
  totalFiltered: number;
  entityLabel: string;
}

/** Generic TanStack-table adapter. Delegates all rendering to PaginationFooterShell. */
export function TableFooter<T>({
  table,
  totalFiltered,
  entityLabel,
}: TableFooterProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const from = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered);

  return (
    <PaginationFooterShell
      from={from}
      to={to}
      total={totalFiltered}
      pageSize={pageSize}
      canPrev={table.getCanPreviousPage()}
      canNext={table.getCanNextPage()}
      onPrev={() => table.previousPage()}
      onNext={() => table.nextPage()}
      onPageSizeChange={(size) => {
        table.setPageSize(size);
        table.setPageIndex(0);
      }}
      entityLabel={entityLabel}
    />
  );
}
