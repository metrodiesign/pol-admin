"use client";

import { useState, useMemo, useCallback } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type PaginationState,
  type Table,
} from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { Branch, Agent } from "@/types/originator";
import { makeBranchColumns, type BranchColumnHandlers } from "./branches-columns";

export interface UseBranchesTableOptions {
  branches: Branch[];
  agents: Agent[];
  handlers: BranchColumnHandlers;
}

export interface UseBranchesTable {
  table: Table<Branch>;
  search: string;
  regionFilter: string;
  statusFilter: string;
  selectedBranch: Branch | null;
  filteredCount: number;
  setSearch: (v: string) => void;
  setRegionFilter: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setSelectedBranch: (b: Branch | null) => void;
  clearFilters: () => void;
}

export function useBranchesTable({
  branches,
  agents,
  handlers,
}: UseBranchesTableOptions): UseBranchesTable {
  const [search, setSearchRaw] = useState("");
  const [regionFilter, setRegionFilterRaw] = useState("__all__");
  const [statusFilter, setStatusFilterRaw] = useState("__all__");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const setSearch = useCallback(
    (v: string) => {
      setSearchRaw(v);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    [],
  );

  const setRegionFilter = useCallback(
    (v: string) => {
      setRegionFilterRaw(v);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    [],
  );

  const setStatusFilter = useCallback(
    (v: string) => {
      setStatusFilterRaw(v);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    [],
  );

  const filteredData = useMemo<Branch[]>(() => {
    let list = branches;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.manager.toLowerCase().includes(q) ||
          b.region.toLowerCase().includes(q),
      );
    }

    if (regionFilter !== "__all__") {
      list = list.filter((b) => b.region === regionFilter);
    }

    if (statusFilter === "active") {
      list = list.filter((b) => b.active);
    } else if (statusFilter === "paused") {
      list = list.filter((b) => !b.active);
    }

    return list;
  }, [branches, search, regionFilter, statusFilter]);

  const columns = useMemo(
    () => makeBranchColumns(agents, handlers),
    [agents, handlers],
  );

  const coreRowModel = useMemo(() => getCoreRowModel(), []);
  const sortedRowModel = useMemo(() => getSortedRowModel(), []);
  const paginationRowModel = useMemo(() => getPaginationRowModel(), []);
  const getRowId = useCallback((row: Branch) => row.id, []);

  const table = useDataTable<Branch>({
    data: filteredData,
    columns,
    getRowId,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
    getPaginationRowModel: paginationRowModel,
    meta: {
      onRowClick: (row: Branch) => setSelectedBranch(row),
    },
    enableMultiSort: false,
  });

  const clearFilters = useCallback(() => {
    setSearchRaw("");
    setRegionFilterRaw("__all__");
    setStatusFilterRaw("__all__");
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, []);

  return {
    table,
    search,
    regionFilter,
    statusFilter,
    selectedBranch,
    filteredCount: filteredData.length,
    setSearch,
    setRegionFilter,
    setStatusFilter,
    setSelectedBranch,
    clearFilters,
  };
}
