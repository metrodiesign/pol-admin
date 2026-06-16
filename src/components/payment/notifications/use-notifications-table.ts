"use client";

import { useState, useMemo } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type PaginationState,
  type Table,
} from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { Notification, NotificationType, NotificationStatus } from "@/lib/mock/notifications";
import { NOTIFICATIONS } from "@/lib/mock/notifications";
import { notifColumns } from "./notifications-columns";

export type NotifChannelFilter = NotificationType | "all";
export type NotifStatusFilter = NotificationStatus | "all";

export interface NotificationsTableState {
  table: Table<Notification>;
  channelFilter: NotifChannelFilter;
  statusFilter: NotifStatusFilter;
  search: string;
  selectedNotif: Notification | null;
  drawerOpen: boolean;
  resendNotif: Notification | null;
  resendDialogOpen: boolean;
  filteredCount: number;
  channelCounts: Record<NotifChannelFilter, number>;
  hasActiveFilters: boolean;
  setChannelFilter: (v: NotifChannelFilter) => void;
  setStatusFilter: (v: NotifStatusFilter) => void;
  setSearch: (v: string) => void;
  setDrawerOpen: (open: boolean) => void;
  setSelectedNotif: (n: Notification | null) => void;
  setResendNotif: (n: Notification | null) => void;
  setResendDialogOpen: (open: boolean) => void;
  clearFilters: () => void;
}

export function useNotificationsTable(): NotificationsTableState {
  const [channelFilter, setChannelFilter] = useState<NotifChannelFilter>("all");
  const [statusFilter, setStatusFilter] = useState<NotifStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resendNotif, setResendNotif] = useState<Notification | null>(null);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([{ id: "sentAt", desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const filteredData = useMemo<Notification[]>(() => {
    return NOTIFICATIONS.filter((n) => {
      if (channelFilter !== "all" && n.type !== channelFilter) return false;
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const match =
          n.recipient.toLowerCase().includes(s) ||
          n.subject.toLowerCase().includes(s) ||
          n.orig.toLowerCase().includes(s) ||
          n.templateName.toLowerCase().includes(s);
        if (!match) return false;
      }
      return true;
    });
  }, [channelFilter, statusFilter, search]);

  const channelCounts = useMemo<Record<NotifChannelFilter, number>>(() => {
    // counts on unfiltered data, but respect status + search filters
    const base = NOTIFICATIONS.filter((n) => {
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          n.recipient.toLowerCase().includes(s) ||
          n.subject.toLowerCase().includes(s) ||
          n.orig.toLowerCase().includes(s) ||
          n.templateName.toLowerCase().includes(s)
        );
      }
      return true;
    });
    return {
      all: base.length,
      sms: base.filter((n) => n.type === "sms").length,
      email: base.filter((n) => n.type === "email").length,
    };
  }, [statusFilter, search]);

  const hasActiveFilters =
    channelFilter !== "all" || statusFilter !== "all" || search !== "";

  const table = useDataTable<Notification>({
    data: filteredData,
    columns: notifColumns,
    state: { sorting, pagination },
    meta: {
      onRowClick: (row: Notification) => {
        setSelectedNotif(row);
        setDrawerOpen(true);
      },
      onResend: (row: Notification) => {
        setResendNotif(row);
        setResendDialogOpen(true);
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.id),
  });

  const clearFilters = () => {
    setChannelFilter("all");
    setStatusFilter("all");
    setSearch("");
  };

  return {
    table,
    channelFilter,
    statusFilter,
    search,
    selectedNotif,
    drawerOpen,
    resendNotif,
    resendDialogOpen,
    filteredCount: filteredData.length,
    channelCounts,
    hasActiveFilters,
    setChannelFilter,
    setStatusFilter,
    setSearch,
    setDrawerOpen,
    setSelectedNotif,
    setResendNotif,
    setResendDialogOpen,
    clearFilters,
  };
}
