"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MockProduct } from "@/lib/mock/product";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductTableRow } from "./product-table-row";
import { ProductListToolbar } from "./product-list-toolbar";

interface ProductTableProps {
  products: MockProduct[];
}

const ROWS_OPTIONS = [10, 25, 50] as const;

export function ProductTable({ products }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [publishFilter, setPublishFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<10 | 25 | 50>(10);

  const filtered = useMemo(() => {
    let list = [...products];
    if (stockFilter) list = list.filter((p) => p.stockLabel === stockFilter);
    if (publishFilter) list = list.filter((p) => p.publish === publishFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, stockFilter, publishFilter, search]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const allSelected =
    paginated.length > 0 && paginated.every((p) => selected.has(p.id));
  const someSelected = paginated.some((p) => selected.has(p.id));

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelected(new Set(paginated.map((p) => p.id)));
      } else {
        setSelected(new Set());
      }
    },
    [paginated],
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const rangeStart = filtered.length === 0 ? 0 : page * rowsPerPage + 1;
  const rangeEnd = Math.min((page + 1) * rowsPerPage, filtered.length);

  return (
    <div
      className="rounded-[16px] bg-card"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      <ProductListToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        stock={stockFilter}
        onStockChange={(v) => {
          setStockFilter(v);
          setPage(0);
        }}
        publish={publishFilter}
        onPublishChange={(v) => {
          setPublishFilter(v);
          setPage(0);
        }}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="h-14 border-b border-dashed border-[var(--divider)] bg-grey-200">
              <th className="w-12 pl-1 pr-0 text-left">
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-grey-600">
                Product
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-grey-600">
                Create at
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-grey-600">
                Stock
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-grey-600">
                Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-grey-600">
                Publish
              </th>
              <th className="w-12 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                selected={selected.has(product.id)}
                onSelect={(checked) => handleSelectOne(product.id, checked)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 border-t border-dashed border-[var(--divider)] px-4 py-3">
        <span className="hidden text-sm text-grey-500 sm:block">
          Rows per page:
        </span>
        <Select
          value={String(rowsPerPage)}
          onValueChange={(v) => {
            setRowsPerPage(Number(v) as 10 | 25 | 50);
            setPage(0);
          }}
        >
          <SelectTrigger
            aria-label="Rows per page"
            className="hidden h-8 w-auto gap-1 border-none px-1 text-sm font-semibold text-foreground sm:flex"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROWS_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-grey-500">
          {rangeStart}–{rangeEnd} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-full p-1.5 text-grey-600 transition-colors hover:bg-[var(--action-hover)] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-full p-1.5 text-grey-600 transition-colors hover:bg-[var(--action-hover)] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
