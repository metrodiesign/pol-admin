"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";
import { POSTS } from "@/lib/mock/post";
import type { PostStatus } from "@/types/post";

type SortOrder = "latest" | "oldest" | "popular";

const POSTS_PER_PAGE = 20;
const TOTAL_PAGES = 8;

function PaginationBar({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const pages = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center justify-center gap-1 py-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex size-9 items-center justify-center rounded-full text-sm text-grey-700 hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        &lsaquo;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
            page === p
              ? "bg-foreground text-card font-bold"
              : "text-grey-700 hover:bg-grey-100"
          }`}
        >
          {p}
        </button>
      ))}
      <span className="flex size-9 items-center justify-center text-sm text-grey-500">
        &hellip;
      </span>
      <button
        onClick={() => onPageChange(total)}
        className={`flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
          page === total
            ? "bg-grey-800 text-white font-bold"
            : "text-grey-700 hover:bg-grey-100"
        }`}
      >
        {total}
      </button>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === total}
        className="flex size-9 items-center justify-center rounded-full text-sm text-grey-700 hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        &rsaquo;
      </button>
    </div>
  );
}

const SORT_LABELS: Record<SortOrder, string> = {
  latest: "Latest",
  oldest: "Oldest",
  popular: "Popular",
};

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
        aria-label="Search posts"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-grey-500 outline-none"
      />
    </div>
  );
}

export function PostListView() {
  const [tab, setTab] = useState<"all" | PostStatus>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [page, setPage] = useState(1);

  const allCount = POSTS.length;
  const publishedCount = POSTS.filter((p) => p.status === "published").length;
  const draftCount = POSTS.filter((p) => p.status === "draft").length;

  const filtered = useMemo(() => {
    let list = [...POSTS];
    if (tab === "published") list = list.filter((p) => p.status === "published");
    if (tab === "draft") list = list.filter((p) => p.status === "draft");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (sortOrder === "oldest") list = [...list].reverse();
    if (sortOrder === "popular") {
      list = [...list].sort((a, b) => {
        const av = parseFloat(a.views.replace("k", "")) * (a.views.includes("k") ? 1000 : 1);
        const bv = parseFloat(b.views.replace("k", "")) * (b.views.includes("k") ? 1000 : 1);
        return bv - av;
      });
    }
    return list;
  }, [tab, search, sortOrder]);

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  }, [filtered, page]);

  const handleTabChange = (value: "all" | PostStatus) => {
    setTab(value);
    setPage(1);
  };

  return (
    <>
      {/* Toolbar row */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {/* Search */}
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="select-none text-sm font-medium text-grey-800">Search</span>
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
          />
        </div>

        {/* Sort by */}
        <div className="flex flex-col gap-1.5">
          <span className="select-none text-sm font-medium text-grey-800">Sort by</span>
          <div className="flex flex-1 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-12 gap-1.5 px-3 text-sm font-semibold text-grey-800"
                  />
                }
              >
                Sort By: {SORT_LABELS[sortOrder]}
                <ChevronDown className="size-4 text-grey-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                {(["latest", "oldest", "popular"] as SortOrder[]).map((o) => (
                  <DropdownMenuItem key={o} onClick={() => setSortOrder(o)}>
                    {SORT_LABELS[o]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-10 mb-6 border-b border-grey-200">
        {(
          [
            { value: "all" as const, label: "All", count: allCount },
            {
              value: "published" as const,
              label: "Published",
              count: publishedCount,
            },
            { value: "draft" as const, label: "Draft", count: draftCount },
          ] as Array<{ value: "all" | PostStatus; label: string; count: number }>
        ).map(({ value, label, count }) => {
          const isActive = tab === value;
          return (
            <button
              key={value}
              onClick={() => handleTabChange(value)}
              className={`relative flex items-center gap-2 pt-2.5 pb-3 text-sm font-semibold transition-colors outline-none ${
                isActive
                  ? "text-grey-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-foreground"
                  : "text-grey-600 hover:text-grey-800"
              }`}
            >
              {label}
              <span
                className={`inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5 text-xs font-bold ${
                  value === "all"
                    ? "bg-foreground text-card"
                    : value === "published"
                    ? "bg-info/16 text-info-dark"
                    : "bg-grey-200 text-grey-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-2">
        {paginated.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination */}
      <PaginationBar
        page={page}
        total={TOTAL_PAGES}
        onPageChange={setPage}
      />
    </>
  );
}
