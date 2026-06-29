"use client";

import { cn } from "@/lib/utils";

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

function getPageRange(page: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const set = new Set([0, 1, page - 1, page, page + 1, total - 2, total - 1]);
  const sorted = [...set].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    if (i > 0 && cur - sorted[i - 1]! > 1) result.push("...");
    result.push(cur);
  }
  return result;
}

export function TablePagination({
  page,
  rowsPerPage,
  count,
  onPageChange,
  onRowsPerPageChange: _onRowsPerPageChange,
  rowsPerPageOptions: _rowsPerPageOptions,
}: TablePaginationProps) {
  const totalPages = Math.ceil(count / rowsPerPage);
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, count);
  const range = getPageRange(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-dashed border-grey-200 px-4 py-3 dark:border-grey-800 sm:flex-row sm:items-center sm:justify-between">
      {/* Meta: count */}
      <span className="tabular-nums text-xs text-grey-500">
        {from} ถึง {to} จาก {count} รายการ
      </span>

      {/* Nav group: Previous + pages + Next */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium transition-colors",
            page === 0
              ? "cursor-not-allowed text-grey-400"
              : "text-grey-700 hover:text-foreground",
          )}
        >
          Previous
        </button>

        <div className="flex items-center gap-0.5">
          {range.map((item, i) =>
            item === "..." ? (
              <span
                key={`dots-${i}`}
                className="flex size-9 select-none items-center justify-center text-sm text-grey-500"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={cn(
                  "size-9 rounded-lg text-sm font-medium transition-colors",
                  item === page
                    ? "bg-grey-200 font-semibold text-grey-900"
                    : "text-grey-600 hover:bg-grey-100 hover:text-grey-900",
                )}
              >
                {item + 1}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium transition-colors",
            page >= totalPages - 1
              ? "cursor-not-allowed text-grey-400"
              : "text-grey-700 hover:text-foreground",
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
