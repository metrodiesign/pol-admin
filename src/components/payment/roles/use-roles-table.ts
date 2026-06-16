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
import type { Role, RolePortal } from "@/types/role";
import { makeRolesColumns } from "./roles-columns";

export type RolesPortalFilter = "all" | RolePortal;

interface UseRolesTableArgs {
  roles: Role[];
  rolePerms: Record<string, string[]>;
  usageByRole: Record<string, number>;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (role: Role) => void;
  /** Row-click handler — typically opens the detail drawer. Owned by the page. */
  onRowClick: (role: Role) => void;
}

export interface UseRolesTableState {
  table: Table<Role>;
  portalFilter: RolesPortalFilter;
  search: string;
  portalCounts: { all: number; admin: number; merchant: number };
  filteredCount: number;
  setPortalFilter: (v: RolesPortalFilter) => void;
  setSearch: (v: string) => void;
  clearFilters: () => void;
}

export function useRolesTable({
  roles,
  rolePerms,
  usageByRole,
  onEdit,
  onDuplicate,
  onDelete,
  onRowClick,
}: UseRolesTableArgs): UseRolesTableState {
  const [portalFilter, setPortalFilterRaw] = useState<RolesPortalFilter>("all");
  const [search, setSearchRaw] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const portalCounts = useMemo(
    () => ({
      all: roles.length,
      admin: roles.filter((r) => r.portal === "admin").length,
      merchant: roles.filter((r) => r.portal === "merchant").length,
    }),
    [roles],
  );

  const filteredData = useMemo<Role[]>(() => {
    let base = roles;
    if (portalFilter !== "all") {
      base = base.filter((r) => r.portal === portalFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      base = base.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.id.toLowerCase().includes(s) ||
          (r.desc || "").toLowerCase().includes(s),
      );
    }
    return base;
  }, [roles, portalFilter, search]);

  const handlers = useMemo(
    () => ({ onEdit, onDuplicate, onDelete }),
    [onEdit, onDuplicate, onDelete],
  );

  const columns = useMemo(
    () => makeRolesColumns({ rolePerms, usageByRole }, handlers),
    [rolePerms, usageByRole, handlers],
  );

  const coreRowModel = useMemo(() => getCoreRowModel<Role>(), []);
  const sortedRowModel = useMemo(() => getSortedRowModel<Role>(), []);
  const paginationRowModel = useMemo(() => getPaginationRowModel<Role>(), []);
  const getRowId = useCallback((row: Role) => row.id, []);

  const table = useDataTable<Role>({
    data: filteredData,
    columns,
    getRowId,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
    getPaginationRowModel: paginationRowModel,
    meta: { onRowClick },
    enableMultiSort: false,
  });

  const setPortalFilter = useCallback(
    (v: RolesPortalFilter) => {
      setPortalFilterRaw(v);
      table.setPageIndex(0);
    },
    [table],
  );

  const setSearch = useCallback(
    (v: string) => {
      setSearchRaw(v);
      table.setPageIndex(0);
    },
    [table],
  );

  const clearFilters = useCallback(() => {
    setPortalFilterRaw("all");
    setSearchRaw("");
    table.setPageIndex(0);
  }, [table]);

  return {
    table,
    portalFilter,
    search,
    portalCounts,
    filteredCount: filteredData.length,
    setPortalFilter,
    setSearch,
    clearFilters,
  };
}
