"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Loader2, RefreshCw } from "lucide-react";
import type { SettlementBatch } from "@/types/settlement";
import { PSP_LABEL, variance } from "@/lib/control/settlement";
import { useControlStore } from "@/lib/control/store";
import {
  settlementStore,
  runReconciliation,
} from "@/lib/control/settlement-store";
import { showControlToast } from "@/components/control/shared/control-toast";
import { TENANT_LABEL } from "@/lib/mock/tenants";
import { formatTHB } from "@/lib/utils";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlListToolbar } from "@/components/control/shared/control-list-toolbar";
import { Button } from "@/components/ui/button";
import { settlementColumns } from "./settlement-columns";
import "@/types/table-meta";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-sm font-semibold text-grey-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
        {value}
      </p>
    </div>
  );
}

export function ReconciliationView() {
  const router = useRouter();
  const batches = useControlStore(settlementStore);
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("");
  const [psp, setPsp] = useState("");
  const [matchStatus, setMatchStatus] = useState("");
  const [dense, setDense] = useState(false);
  const [running, setRunning] = useState(false);

  const matched = batches.filter((b) => b.matchStatus === "matched").length;
  const totalVariance = batches
    .filter((b) => b.matchStatus === "variance")
    .reduce((sum, b) => sum + Math.abs(variance(b)), 0);

  const handleRun = () => {
    if (running) return;
    setRunning(true);
    // Mock: resolve unreconciled batches after a short window. Idempotent — the
    // guard above blocks re-entry while a run is in flight. Date/setTimeout live
    // inside this event handler, never at module/render top level.
    setTimeout(() => {
      runReconciliation(new Date().toISOString().slice(0, 19));
      showControlToast("กระทบยอดเสร็จสิ้น", "ok");
      setRunning(false);
    }, 900);
  };

  const globalFilter = useMemo(
    () => ({ search, tenant, psp, matchStatus }),
    [search, tenant, psp, matchStatus],
  );

  const table = useDataTable<SettlementBatch>({
    data: batches,
    columns: settlementColumns,
    getRowId: (b) => b.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: {
      onRowClick: (b) => router.push(`/control/reconciliation/read?id=${b.id}`),
    },
    globalFilterFn: (row, _id, value) => {
      const f = value as {
        search: string;
        tenant: string;
        psp: string;
        matchStatus: string;
      };
      const b = row.original;
      if (f.tenant && b.tenantId !== f.tenant) return false;
      if (f.psp && b.psp !== f.psp) return false;
      if (f.matchStatus && b.matchStatus !== f.matchStatus) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !b.batchRef.toLowerCase().includes(q) &&
          !b.id.toLowerCase().includes(q)
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
      sorting: [{ id: "matchStatus", desc: false }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const resetPage = () => table.setPageIndex(0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="ชุดทั้งหมด" value={String(batches.length)} />
        <StatCard label="กระทบยอดตรง" value={String(matched)} />
        <StatCard label="ส่วนต่างรวม" value={formatTHB(totalVariance, 2)} />
      </div>

      <div
        className="flex flex-col gap-3 rounded-2xl bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="max-w-xl text-xs text-grey-600">
          เงิน settle จาก PSP เข้าบัญชีบริษัทโดยตรง — แพลตฟอร์มติดตามสถานะ
          ไม่ถือเงิน
        </p>
        <Button size="lg" onClick={handleRun} disabled={running}>
          {running ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RefreshCw />
          )}
          {running ? "กำลังกระทบยอด..." : "กระทบยอด"}
        </Button>
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
          searchPlaceholder="ค้นหา batch reference, รหัสชุด..."
          filters={[
            {
              label: "บริษัท",
              value: tenant,
              onChange: (v) => {
                setTenant(v);
                resetPage();
              },
              options: Object.entries(TENANT_LABEL).map(([value, label]) => ({
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
              label: "สถานะ",
              value: matchStatus,
              onChange: (v) => {
                setMatchStatus(v);
                resetPage();
              },
              options: [
                { value: "matched", label: "กระทบยอดตรง" },
                { value: "variance", label: "ยอดไม่ตรง" },
                { value: "unreconciled", label: "ยังไม่กระทบยอด" },
              ],
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
