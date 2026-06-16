"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { FileManagerItem } from "@/lib/mock/file-manager";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { FileManagerTableRow } from "./file-manager-table-row";

type SortKey = "name" | "size" | "type" | "modifiedDate";
type SortDir = "asc" | "desc";

interface FileManagerTableProps {
  items: FileManagerItem[];
  selected: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onStarToggle: (id: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  dense: boolean;
  allSelected: boolean;
  someSelected: boolean;
}

const COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size" },
  { key: "type", label: "Type" },
  { key: "modifiedDate", label: "Modified" },
];

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (column !== sortKey) {
    return (
      <ArrowUpDown className="size-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
    );
  }
  return sortDir === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

export function FileManagerTable({
  items,
  selected,
  onSelectAll,
  onSelectOne,
  onStarToggle,
  sortKey,
  sortDir,
  onSort,
  dense,
  allSelected,
  someSelected,
}: FileManagerTableProps) {
  return (
    <Table className="min-w-[960px]">
      <TableHeader>
        <TableRow className="border-b-grey-200 hover:bg-transparent">
          <TableHead className="w-12 pl-1 pr-0 bg-grey-200">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={onSelectAll}
              aria-label="Select all"
            />
          </TableHead>
          {COLUMNS.map((col) => (
            <TableHead
              key={col.key}
              className="px-4 py-4 text-sm font-semibold text-grey-600 bg-grey-200"
            >
              <button
                type="button"
                onClick={() => onSort(col.key)}
                className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                {col.label}
                <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />
              </button>
            </TableHead>
          ))}
          {/* Shared header */}
          <TableHead className="px-4 py-4 text-sm font-semibold text-grey-600 bg-grey-200">
            Shared
          </TableHead>
          {/* Actions — no label */}
          <TableHead className="w-24 bg-grey-200" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <FileManagerTableRow
            key={item.id}
            item={item}
            selected={selected.has(item.id)}
            onSelect={(checked) => onSelectOne(item.id, checked)}
            onStarToggle={onStarToggle}
            dense={dense}
          />
        ))}
      </TableBody>
    </Table>
  );
}
