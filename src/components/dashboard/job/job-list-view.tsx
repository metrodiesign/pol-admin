"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { JOBS } from "@/lib/mock/job";
import { JobCard } from "./job-card";

const PAGE_SIZE = 12;

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  // Build visible page numbers — show up to 5 pages in a window + ellipsis + last
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Always show first page
    pages.push(1);
    // Window of 3 centered on current page (but anchored near start/end)
    const windowStart = Math.max(2, Math.min(page - 1, totalPages - 5));
    const windowEnd = Math.min(totalPages - 1, Math.max(page + 1, 5));
    if (windowStart > 2) pages.push("…");
    for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
    if (windowEnd < totalPages - 1) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-8">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="flex size-9 items-center justify-center rounded-full text-sm text-grey-600 transition-colors hover:bg-grey-100 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="flex size-9 items-center justify-center text-sm text-grey-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p as number)}
            className={
              p === page
                ? "flex size-9 items-center justify-center rounded-full bg-foreground text-sm font-bold text-card"
                : "flex size-9 items-center justify-center rounded-full text-sm text-grey-600 transition-colors hover:bg-grey-100"
            }
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="flex size-9 items-center justify-center rounded-full text-sm text-grey-600 transition-colors hover:bg-grey-100 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function JobSearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Search jobs"
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-grey-500 outline-none"
      />
    </div>
  );
}

export function JobListView() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"Latest" | "Oldest" | "Popular">(
    "Latest"
  );
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...JOBS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((j) => j.title.toLowerCase().includes(q));
    }
    if (sortOrder === "Oldest") list.reverse();
    return list;
  }, [search, sortOrder]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
        {/* Search */}
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="select-none text-sm font-medium text-grey-800">Search</span>
          <JobSearchInput value={search} onChange={handleSearch} />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-1.5">
          <span className="select-none text-sm font-medium text-grey-800">Filters</span>
          <div className="flex flex-1 items-center">
            <button
              type="button"
              className="flex h-12 min-w-[120px] items-center gap-1.5 rounded-control border border-[var(--divider)] px-3.5 text-sm font-semibold text-grey-700 transition-colors hover:bg-[var(--action-hover)]"
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Sort by */}
        <div className="flex flex-col gap-1.5">
          <span className="select-none text-sm font-medium text-grey-800">Sort by</span>
          <div className="relative flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="flex h-12 min-w-[140px] items-center gap-1.5 rounded-control border border-[var(--divider)] px-3.5 text-sm font-semibold text-grey-700 transition-colors hover:bg-[var(--action-hover)]"
            >
              {sortOrder}
              <ChevronDown className="size-4" />
            </button>
            {sortOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[140px] rounded-xl bg-card py-1 shadow-[0_0_2px_rgba(145,158,171,0.24),-20px_20px_40px_-4px_rgba(145,158,171,0.24)]">
                {(["Latest", "Oldest", "Popular"] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => { setSortOrder(o); setSortOpen(false); }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-[var(--action-hover)] ${sortOrder === o ? "font-semibold text-grey-900" : "text-grey-700"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mmd:grid-cols-3">
        {paginated.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
    </div>
  );
}
