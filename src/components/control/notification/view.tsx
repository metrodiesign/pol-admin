"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useControlStore } from "@/lib/control/store";
import {
  notificationRulesStore,
  toggleNotificationRule,
} from "@/lib/control/notifications-store";
import { showControlToast } from "@/components/control/shared/toast";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type {
  NotificationRule,
  NotificationLogEntry,
} from "@/types/control/notification";
import { NOTIFICATION_LOG } from "@/lib/mock/control/notifications";
import {
  CHANNEL_LABEL,
  LOG_STATUS_LABEL,
  eventLabel,
} from "@/lib/control/notification";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlToolbar } from "@/components/control/shared/toolbar";
import { buildNotificationRuleColumns } from "./rule-columns";
import { notificationLogColumns } from "./log-columns";
import { NotificationTabs, type NotificationTab } from "./tabs";
import "@/types/table-meta";

function RulesTab({ rules }: { rules: NotificationRule[] }) {
  const columns = useMemo(
    () =>
      buildNotificationRuleColumns((id, current) => {
        toggleNotificationRule(id);
        showControlToast(
          current ? "ปิดกฎการแจ้งเตือนแล้ว" : "เปิดกฎการแจ้งเตือนแล้ว",
          "ok",
        );
      }),
    [],
  );

  const table = useDataTable<NotificationRule>({
    data: rules,
    columns,
    getRowId: (r) => r.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "event", desc: false }],
    },
  });

  return <DataTable table={table} hidePagination showSelectionAction={false} />;
}

function LogTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [dense, setDense] = useState(false);

  const globalFilter = useMemo(
    () => ({ search, channel, status }),
    [search, channel, status],
  );

  const table = useDataTable<NotificationLogEntry>({
    data: NOTIFICATION_LOG,
    columns: notificationLogColumns,
    getRowId: (e) => e.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: {
      onRowClick: (e) => router.push(`/control/notifications/read?id=${e.id}`),
    },
    globalFilterFn: (row, _id, value) => {
      const f = value as { search: string; channel: string; status: string };
      const e = row.original;
      if (f.channel && e.channel !== f.channel) return false;
      if (f.status && e.status !== f.status) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !e.target.toLowerCase().includes(q) &&
          !e.event.toLowerCase().includes(q) &&
          !eventLabel(e.event).toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: "sentAt", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const resetPage = () => table.setPageIndex(0);

  return (
    <>
      <ControlToolbar
        search={{
          value: search,
          onChange: (v) => {
            setSearch(v);
            resetPage();
          },
          placeholder: "ค้นหาเหตุการณ์, ปลายทาง...",
        }}
        filters={[
          {
            label: "ช่องทาง",
            value: channel,
            onChange: (v) => {
              setChannel(v);
              resetPage();
            },
            options: Object.entries(CHANNEL_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
          },
          {
            label: "สถานะ",
            value: status,
            onChange: (v) => {
              setStatus(v);
              resetPage();
            },
            options: Object.entries(LOG_STATUS_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
          },
        ]}
        rowsPerPage={{
          value: table.getState().pagination.pageSize,
          onChange: (n) => {
            table.setPageSize(n);
            resetPage();
          },
          options: [10, 25, 50],
        }}
      />
      <DataTable
        table={table}
        total={filteredCount}
        dense={dense}
        onDenseChange={setDense}
        rowsPerPageOptions={[10, 25, 50]}
        searchQuery={search}
        showSelectionAction={false}
      />
    </>
  );
}

export function NotificationsView() {
  const rules = useControlStore(notificationRulesStore);
  const [tab, setTab] = useState<NotificationTab>("rules");

  return (
    <div
      className="overflow-hidden rounded-2xl bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <NotificationTabs
        tabs={[
          { label: "กฎการแจ้งเตือน", value: "rules", count: rules.length },
          { label: "ประวัติการส่ง", value: "log", count: NOTIFICATION_LOG.length },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === "rules" ? <RulesTab rules={rules} /> : <LogTab />}
    </div>
  );
}
