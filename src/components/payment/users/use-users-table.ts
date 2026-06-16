"use client";

import { useState, useMemo, useCallback } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
  type Table,
} from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { useToast } from "@/components/payment/toast/toast-provider";
import { makeUserColumns } from "./users-columns";
import type { User, UserStatus, UserPortal } from "@/types/user";
import type { Role } from "@/types/role";
import type { UserTab } from "./user-filter-bar";

export interface ConfirmConfig {
  title: string;
  description: string;
  destructive: boolean;
  onConfirm: () => void;
}

export interface UsersTableCounts {
  all: number;
  pending: number;
  active: number;
  disabled: number;
}

export interface UseUsersTableState {
  table: Table<User>;
  /* filter state */
  tab: UserTab;
  portal: UserPortal | "all";
  search: string;
  setTab: (t: UserTab) => void;
  setPortal: (p: UserPortal | "all") => void;
  setSearch: (s: string) => void;
  clearFilters: () => void;
  /* counts */
  counts: UsersTableCounts;
  adminCount: number;
  merchantCount: number;
  totalUsers: number;
  filteredCount: number;
  rowSelectionCount: number;
  /* drawer */
  selectedUser: User | null;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  setSelectedUser: (u: User | null) => void;
  /* confirm modal */
  confirmOpen: boolean;
  confirmConfig: ConfirmConfig;
  setConfirmOpen: (open: boolean) => void;
  /* mutations */
  updateUser: (id: string, patch: Partial<User>) => void;
  bulkApprove: () => void;
}

export function useUsersTable(
  initialUsers: User[],
  roles: Role[],
): UseUsersTableState {
  const toast = useToast();

  /* ─── users state ─── */
  const [users, setUsers] = useState<User[]>(initialUsers);

  /* ─── filters ─── */
  const [tab, setTabState] = useState<UserTab>("all");
  const [portal, setPortalState] = useState<UserPortal | "all">("all");
  const [search, setSearchState] = useState("");

  /* ─── table controlled state ─── */
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  /* ─── drawer ─── */
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback((u: User) => {
    setSelectedUser(u);
    setDrawerOpen(true);
  }, []);

  /* ─── confirm modal ─── */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    title: "",
    description: "",
    destructive: false,
    onConfirm: () => {},
  });

  const askConfirm = useCallback((cfg: ConfirmConfig) => {
    setConfirmConfig(cfg);
    setConfirmOpen(true);
  }, []);

  /* ─── mutations ─── */
  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const approve = useCallback(
    (u: User) => {
      updateUser(u.id, {
        status: "active",
        roles: u.requestedRole ? [u.requestedRole] : ["merchant.viewer"],
      });
      toast.success("อนุมัติผู้ใช้แล้ว");
    },
    [updateUser, toast],
  );

  const reject = useCallback(
    (u: User) => {
      askConfirm({
        title: `ปฏิเสธบัญชี ${u.name}?`,
        description:
          "บัญชีนี้จะถูกลบออกจากระบบ ผู้สมัครจะได้รับอีเมลแจ้งเหตุผล",
        destructive: true,
        onConfirm: () => {
          setUsers((prev) => prev.filter((x) => x.id !== u.id));
          toast.success("ปฏิเสธบัญชีแล้ว");
        },
      });
    },
    [askConfirm, toast],
  );

  const toggleDisable = useCallback(
    (u: User) => {
      const next: UserStatus = u.status === "disabled" ? "active" : "disabled";
      if (next === "disabled") {
        askConfirm({
          title: `ปิดใช้งานบัญชี ${u.name}?`,
          description:
            "ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้ทันที session ปัจจุบันจะถูก revoke",
          destructive: true,
          onConfirm: () => {
            updateUser(u.id, { status: "disabled" });
            toast.info("ปิดใช้งานบัญชีแล้ว");
          },
        });
      } else {
        updateUser(u.id, { status: "active" });
        toast.info("เปิดใช้งานบัญชีแล้ว");
      }
    },
    [askConfirm, updateUser, toast],
  );

  /* ─── bulk approve ─── */
  const bulkApprove = useCallback(() => {
    const selectedKeys = Object.keys(rowSelection);
    const pendingSelected = users.filter(
      (u) => selectedKeys.includes(u.id) && u.status === "pending",
    ).length;
    setUsers((prev) =>
      prev.map((u) => {
        if (selectedKeys.includes(u.id) && u.status === "pending") {
          return {
            ...u,
            status: "active" as UserStatus,
            roles: u.requestedRole ? [u.requestedRole] : ["merchant.viewer"],
          };
        }
        return u;
      }),
    );
    setRowSelection({});
    if (pendingSelected > 0) {
      toast.success(`อนุมัติ ${pendingSelected} รายการแล้ว`);
    }
  }, [rowSelection, users, toast]);

  /* ─── derived counts ─── */
  const counts = useMemo<UsersTableCounts>(
    () => ({
      all: users.length,
      pending: users.filter((u) => u.status === "pending").length,
      active: users.filter((u) => u.status === "active").length,
      disabled: users.filter((u) => u.status === "disabled").length,
    }),
    [users],
  );

  const adminCount = useMemo(
    () => users.filter((u) => u.portal === "admin").length,
    [users],
  );
  const merchantCount = useMemo(
    () => users.filter((u) => u.portal === "merchant").length,
    [users],
  );

  /* ─── filtered data (no manual sort — getSortedRowModel handles it) ─── */
  const filteredData = useMemo<User[]>(() => {
    let base = users;
    if (tab !== "all") base = base.filter((u) => u.status === tab);
    if (portal !== "all") base = base.filter((u) => u.portal === portal);
    if (search) {
      const s = search.toLowerCase();
      base = base.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.empId ?? "").toLowerCase().includes(s) ||
          (u.agentCode ?? "").toLowerCase().includes(s),
      );
    }
    return base;
  }, [users, tab, portal, search]);

  /* ─── memoized row models (use-invoices-table pattern) ─── */
  const coreRowModel = useMemo(() => getCoreRowModel<User>(), []);
  const sortedRowModel = useMemo(() => getSortedRowModel<User>(), []);
  const paginationRowModel = useMemo(() => getPaginationRowModel<User>(), []);
  const getRowId = useCallback((row: User) => row.id, []);

  /* ─── memoized columns ─── */
  const columns = useMemo(
    () =>
      makeUserColumns({
        roles,
        onApprove: approve,
        onReject: reject,
        onToggleDisable: toggleDisable,
        onOpenDrawer: openDrawer,
      }),
    [roles, approve, reject, toggleDisable, openDrawer],
  );

  /* ─── table ─── */
  const table = useDataTable<User>({
    data: filteredData,
    columns,
    getRowId,
    enableRowSelection: true,
    state: { sorting, pagination, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
    getPaginationRowModel: paginationRowModel,
    enableMultiSort: false,
    meta: {
      onRowClick: openDrawer,
    },
  });

  /* ─── filter setters (reset page on every filter change) ─── */
  const setTab = useCallback(
    (t: UserTab) => {
      setTabState(t);
      setRowSelection({});
      table.setPageIndex(0);
    },
    [table],
  );

  const setPortal = useCallback(
    (p: UserPortal | "all") => {
      setPortalState(p);
      setRowSelection({});
      table.setPageIndex(0);
    },
    [table],
  );

  const setSearch = useCallback(
    (s: string) => {
      setSearchState(s);
      table.setPageIndex(0);
    },
    [table],
  );

  const clearFilters = useCallback(() => {
    setTabState("all");
    setPortalState("all");
    setSearchState("");
    table.setPageIndex(0);
  }, [table]);

  return {
    table,
    tab,
    portal,
    search,
    setTab,
    setPortal,
    setSearch,
    clearFilters,
    counts,
    adminCount,
    merchantCount,
    totalUsers: users.length,
    filteredCount: filteredData.length,
    rowSelectionCount: Object.keys(rowSelection).length,
    selectedUser,
    drawerOpen,
    setDrawerOpen,
    setSelectedUser,
    confirmOpen,
    confirmConfig,
    setConfirmOpen,
    updateUser,
    bulkApprove,
  };
}
