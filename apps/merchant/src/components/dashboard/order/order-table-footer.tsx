"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderTableFooterProps {
  dense: boolean;
  onDenseChange: (value: boolean) => void;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function OrderTableFooter({
  dense,
  onDenseChange,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
}: OrderTableFooterProps) {
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, total);
  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div className="flex flex-col-reverse items-start gap-3 border-t border-dashed border-[var(--divider)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Dense toggle */}
      <label className="flex cursor-pointer select-none items-center gap-2">
        <Switch checked={dense} onCheckedChange={onDenseChange} size="sm" />
        <span className="text-sm text-grey-600">Dense</span>
      </label>

      {/* Pagination */}
      <div className="flex flex-nowrap items-center gap-3 text-sm text-grey-600 sm:gap-6">
        <div className="flex flex-nowrap items-center gap-2">
          <span className="whitespace-nowrap">Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(v) => {
              if (v !== null) onRowsPerPageChange(Number(v));
            }}
          >
            <SelectTrigger className="h-7 w-auto gap-1 border-none px-1 text-sm font-semibold text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="whitespace-nowrap tabular-nums">
          {from}–{to} of {total}
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
