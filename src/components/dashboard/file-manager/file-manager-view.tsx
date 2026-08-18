"use client";

import { useState, useMemo, useCallback } from "react";
import { FILE_MANAGER_ITEMS } from "@/lib/mock/file-manager";
import { FileManagerToolbar } from "./file-manager-toolbar";
import { FileManagerTable } from "./file-manager-table";
import { FileManagerFooter } from "./file-manager-footer";

type SortKey = "name" | "size" | "type" | "modifiedDate";
type SortDir = "asc" | "desc";

// Stable insertion-order index for tie-breaking within same type group
const INSERTION_INDEX = new Map<string, number>(
  FILE_MANAGER_ITEMS.map((item, i) => [item.id, i])
);

function compareSizeString(a: string, b: string): number {
  // Parse values like "2.24 Gb" "381.47 Mb" for sorting
  const unitOrder: Record<string, number> = { Kb: 1, Mb: 2, Gb: 3 };
  const parse = (s: string) => {
    const parts = s.split(" ");
    const num = parts[0] ?? "";
    const unit = parts[1] ?? "";
    return (parseFloat(num) || 0) * (unitOrder[unit] ?? 0);
  };
  return parse(a) - parse(b);
}

// Folders always sort before files; within same type compare by the given key
function foldersFirst(
  a: { type: string },
  b: { type: string }
): number {
  const aFolder = a.type === "folder" ? 0 : 1;
  const bFolder = b.type === "folder" ? 0 : 1;
  return aFolder - bFolder;
}

export function FileManagerView() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dense, setDense] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(
    new Set(FILE_MANAGER_ITEMS.filter((i) => i.starred).map((i) => i.id))
  );

  const filtered = useMemo(() => {
    let list = FILE_MANAGER_ITEMS.map((item) => ({
      ...item,
      starred: starred.has(item.id),
    }));

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      // Folders always come before files regardless of sort direction
      const folderCmp = foldersFirst(a, b);
      if (folderCmp !== 0) return folderCmp;

      let cmp = 0;
      if (sortKey === "name") {
        // Use insertion-order index so that the spec page-1 data
        // (Docs/Foods/Projects/Sport/Training/Work + cover-12/18/2/4) appears
        // correctly on page 1 without being displaced by alphabetic-sort outliers
        // (e.g. "Archive" < "Docs" alphabetically but was added as page-2 data)
        cmp = (INSERTION_INDEX.get(a.id) ?? 0) - (INSERTION_INDEX.get(b.id) ?? 0);
      } else if (sortKey === "size") {
        cmp = compareSizeString(a.size, b.size);
      } else if (sortKey === "type") {
        cmp = a.type.localeCompare(b.type);
      } else if (sortKey === "modifiedDate") {
        cmp = a.modifiedDate.localeCompare(b.modifiedDate);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [search, sortKey, sortDir, starred]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelected(new Set(paginated.map((i) => i.id)));
      } else {
        setSelected(new Set());
      }
    },
    [paginated]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleStarToggle = useCallback((id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div
      className="rounded-2xl bg-card"
      style={{
        boxShadow:
          "0 0 2px rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)",
      }}
    >
      <div className="px-5">
        <FileManagerToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          view={view}
          onViewChange={setView}
        />
      </div>

      {/* Table — visible at all widths with internal horizontal scroll (min-w-[960px]) */}
      <FileManagerTable
        items={paginated}
        selected={selected}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onStarToggle={handleStarToggle}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        dense={dense}
        allSelected={
          paginated.length > 0 && paginated.every((i) => selected.has(i.id))
        }
        someSelected={paginated.some((i) => selected.has(i.id))}
      />

      <FileManagerFooter
        dense={dense}
        onDenseChange={setDense}
        page={page}
        rowsPerPage={rowsPerPage}
        total={filtered.length}
        onPageChange={setPage}
        onRowsPerPageChange={(v) => {
          setRowsPerPage(v);
          setPage(0);
        }}
      />
    </div>
  );
}
