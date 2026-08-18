"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ShieldCheck } from "lucide-react";
import type { WebhookEvent } from "@/types/control/webhook-event";
import { WEBHOOK_ENDPOINTS } from "@/lib/mock/control/webhook-events";
import { useControlStore } from "@/lib/control/store";
import { webhookStore, replayEvent } from "@/lib/control/webhook-store";
import { showControlToast } from "@/components/control/shared/toast";
import { PSP_LABEL, DELIVERY_LABEL } from "@/lib/control/webhook";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlListToolbar } from "@/components/control/shared/list-toolbar";
import { webhookColumns } from "./columns";
import "@/types/table-meta";

function EndpointCard({
  merchantId,
  url,
  deliveredToday,
  failedToday,
}: (typeof WEBHOOK_ENDPOINTS)[number]) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-sm font-semibold text-grey-600">
        {MERCHANT_LABEL[merchantId]}
      </p>
      <p className="text-data text-xs break-all text-grey-700">{url}</p>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-success-dark">
          {deliveredToday} สำเร็จ
        </span>
        <span className="text-sm font-semibold text-error-dark">
          {failedToday} ล้มเหลว
        </span>
        <span className="text-xs text-grey-500">วันนี้</span>
      </div>
    </div>
  );
}

export function WebhooksView() {
  const router = useRouter();
  const events = useControlStore(webhookStore);
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("");
  const [psp, setPsp] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [dense, setDense] = useState(false);
  const [replaying, setReplaying] = useState<Set<string>>(new Set());

  const onReplay = (event: WebhookEvent) => {
    setReplaying((prev) => new Set(prev).add(event.id));
    setTimeout(() => {
      replayEvent(event.id);
      showControlToast("ส่ง event ซ้ำสำเร็จ", "ok");
      setReplaying((prev) => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
    }, 700);
  };

  const columns = useMemo(
    () => webhookColumns({ onReplay, replaying }),
    [replaying],
  );

  const globalFilter = useMemo(
    () => ({ search, tenant, psp, deliveryStatus }),
    [search, tenant, psp, deliveryStatus],
  );

  const table = useDataTable<WebhookEvent>({
    data: events,
    columns,
    getRowId: (e) => e.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: { onRowClick: (e) => router.push(`/control/webhooks/read?id=${e.id}`) },
    globalFilterFn: (row, _id, value) => {
      const f = value as {
        search: string;
        tenant: string;
        psp: string;
        deliveryStatus: string;
      };
      const e = row.original;
      if (f.tenant && e.merchantId !== f.tenant) return false;
      if (f.psp && e.psp !== f.psp) return false;
      if (f.deliveryStatus && e.deliveryStatus !== f.deliveryStatus) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !e.id.toLowerCase().includes(q) &&
          !e.eventType.toLowerCase().includes(q)
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
      sorting: [{ id: "receivedAt", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const resetPage = () => table.setPageIndex(0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WEBHOOK_ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.merchantId} {...ep} />
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-info/30 bg-info/8 px-4 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-info" />
        <p className="text-sm text-grey-700">
          Webhook คือแหล่งความจริงของสถานะการชำระเงิน —
          สถานะทั้งหมดอ้างอิงจาก event ที่ยืนยันแล้ว
        </p>
      </div>

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
          searchPlaceholder="ค้นหา event id, ประเภท event..."
          filters={[
            {
              label: "บริษัท",
              value: tenant,
              onChange: (v) => {
                setTenant(v);
                resetPage();
              },
              options: Object.entries(MERCHANT_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            },
            {
              label: "PSP",
              value: psp,
              onChange: (v) => {
                setPsp(v);
                resetPage();
              },
              options: Object.entries(PSP_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            },
            {
              label: "สถานะการส่ง",
              value: deliveryStatus,
              onChange: (v) => {
                setDeliveryStatus(v);
                resetPage();
              },
              options: Object.entries(DELIVERY_LABEL).map(([value, label]) => ({
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
    </div>
  );
}
