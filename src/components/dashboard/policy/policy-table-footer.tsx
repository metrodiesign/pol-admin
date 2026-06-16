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

interface PolicyTableFooterProps {
  dense: boolean;
  onDenseChange: (value: boolean) => void;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function PolicyTableFooter({
  dense,
  onDenseChange,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
}: PolicyTableFooterProps) {
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, total);
  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div className="flex items-center justify-between border-t border-dashed border-grey-200 px-5 py-3">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <Switch
          checked={dense}
          onCheckedChange={onDenseChange}
          size="sm"
        />
        <span className="text-sm text-grey-600">Dense</span>
      </label>

      <div className="flex items-center gap-6 text-sm text-grey-600">
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
              {[5, 10, 25].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="tabular-nums">
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
