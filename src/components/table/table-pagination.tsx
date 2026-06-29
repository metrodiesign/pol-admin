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

interface TablePaginationProps {
  page: number; // 0-based
  rowsPerPage: number;
  count: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  dense?: boolean;
  onDenseChange?: (value: boolean) => void;
  rowsPerPageOptions?: number[];
}

export function TablePagination({
  page,
  rowsPerPage,
  count,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25],
}: TablePaginationProps) {
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, count);
  const totalPages = Math.ceil(count / rowsPerPage);

  return (
    <div className="flex flex-col-reverse gap-y-2 border-t border-dashed border-grey-200 px-5 py-3 dark:border-grey-800 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">

      <div className="flex items-center gap-3 text-sm text-grey-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(v) => onRowsPerPageChange(Number(v))}
          >
            <SelectTrigger className="h-7 w-auto gap-1 border-none px-1 text-sm font-semibold text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rowsPerPageOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="tabular-nums">
          {from}&ndash;{to} of {count}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="text-grey-600 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="text-grey-600 disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
