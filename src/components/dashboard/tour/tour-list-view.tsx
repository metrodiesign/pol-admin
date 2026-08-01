"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TOURS } from "@/lib/mock/tour";
import type { Tour } from "@/types/tour";
import { TourCard } from "./tour-card";
import { TourFiltersDrawer } from "./tour-filters-drawer";
import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const SORT_OPTIONS = ["Latest", "Oldest", "Popular"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const PAGE_SIZE = 12;

function sortTours(tours: Tour[], sort: SortOption): Tour[] {
  const list = [...tours];
  if (sort === "Latest") return list;
  if (sort === "Oldest") return list.reverse();
  if (sort === "Popular") return list.sort((a, b) => b.rating - a.rating);
  return list;
}

function TourSearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={`flex h-12 items-center gap-2 rounded-control border bg-transparent px-3.5 transition-colors ${
        focused
          ? "border-grey-800 ring-1 ring-inset ring-grey-800"
          : "border-[var(--divider)]"
      }`}
    >
      <Search className="size-5 shrink-0 text-grey-500" />
      <input
        type="text"
        aria-label="Search tours"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-grey-500 outline-none"
      />
    </div>
  );
}

export function TourListView() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("Latest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...TOURS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    return sortTours(list, sort);
  }, [search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleDelete(id: string) {
    // In a real app, this would call a server action / API
    console.log("delete", id);
  }

  // Build page number array for pagination (MUI-style: 1 2 3 4 5 ... 8)
  function getPageNumbers(): (number | "...")[] {
    const total = totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", total);
    } else if (page >= total - 3) {
      pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", total);
    }
    return pages;
  }

  const actionNode = (
    <Link
      href="/minimals/tour/new"
      className="inline-flex h-9 items-center gap-1.5 rounded-control bg-foreground px-3 text-sm font-bold text-card hover:opacity-90 transition-opacity"
    >
      <Plus className="size-4" />
      Add tour
    </Link>
  );

  return (
    <div className="w-full pt-2">
      {/* Page Header */}
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: "Dashboard", href: "/minimals" },
          { name: "Tour", href: "/minimals/tour/list" },
          { name: "List" },
        ]}
        action={actionNode}
        className="mb-6"
      />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
        {/* Search */}
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="select-none text-sm font-medium text-grey-800">Search</span>
          <TourSearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-1.5">
          <span className="select-none text-sm font-medium text-grey-800">Filters</span>
          <div className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex h-12 min-w-[120px] items-center gap-1.5 rounded-control border border-[var(--divider)] px-3.5 text-sm font-bold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Sort by */}
        <div className="flex flex-col gap-1.5">
          <span className="select-none text-sm font-medium text-grey-800">Sort by</span>
          <div className="flex flex-1 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-12 min-w-[140px] items-center gap-1.5 rounded-control border border-[var(--divider)] px-3.5 text-sm font-bold text-grey-800 transition-colors hover:bg-[var(--action-hover)] outline-none">
                {sort}
                <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => { setSort(opt); setPage(1); }}
                    className={opt === sort ? "font-semibold" : ""}
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mmd:grid-cols-3">
        {paginated.map((tour) => (
          <TourCard key={tour.id} tour={tour} onDelete={handleDelete} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-grey-400">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p as number)}
                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-foreground text-card"
                    : "text-grey-700 hover:bg-grey-100"
                }`}
                aria-current={page === p ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* Filters Drawer */}
      <TourFiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </div>
  );
}
