"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useControlStore } from "@/lib/control/store";
import {
  notificationRulesStore,
  toggleNotificationRule,
} from "@/lib/control/notifications-store";
import { showControlToast } from "@/components/control/shared/control-toast";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type {
  NotificationRule,
  NotificationLogEntry,
} from "@/types/notification";
import { NOTIFICATION_LOG } from "@/lib/mock/notifications";
import {
  CHANNEL_LABEL,
  LOG_STATUS_LABEL,
  eventLabel,
} from "@/lib/control/notification";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlListToolbar } from "@/components/control/shared/control-list-toolbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { buildNotificationRuleColumns } from "./notification-rule-columns";
import { notificationLogColumns } from "./notification-log-columns";
import "@/types/table-meta";

function RulesTab() {
  const rules = useControlStore(notificationRulesStore);

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

  return (
    <div
      className="overflow-hidden rounded-2xl bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <DataTable table={table} hidePagination showSelectionAction={false} />
    </div>
  );
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
    <div
      className="overflow-hidden rounded-2xl bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <ControlListToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          resetPage();
        }}
        searchPlaceholder="ค้นหาเหตุการณ์, ปลายทาง..."
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
    </div>
  );
}

export function NotificationsView() {
  return (
    <Tabs defaultValue="rules" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="rules">กฎการแจ้งเตือน</TabsTrigger>
        <TabsTrigger value="log">ประวัติการส่ง</TabsTrigger>
      </TabsList>

      <TabsContent value="rules">
        <RulesTab />
      </TabsContent>
      <TabsContent value="log">
        <LogTab />
      </TabsContent>
    </Tabs>
  );
}
