"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Lock } from "lucide-react";
import type { AuditEntry } from "@/types/control/audit";
import { AUDIT_LOG } from "@/lib/mock/control/audit-log";
import {
  actionLabel,
  distinctActions,
  distinctActors,
} from "@/lib/control/audit";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlListToolbar } from "@/components/control/shared/list-toolbar";
import { auditColumns } from "./columns";
import "@/types/table-meta";

export function AuditLogView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [tenant, setTenant] = useState("");
  const [dense, setDense] = useState(false);

  const globalFilter = useMemo(
    () => ({ search, actor, action, tenant }),
    [search, actor, action, tenant],
  );

  const table = useDataTable<AuditEntry>({
    data: AUDIT_LOG,
    columns: auditColumns,
    getRowId: (e) => e.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: { onRowClick: (e) => router.push(`/control/audit/read?id=${e.id}`) },
    globalFilterFn: (row, _id, value) => {
      const f = value as {
        search: string;
        actor: string;
        action: string;
        tenant: string;
      };
      const e = row.original;
      if (f.actor && e.actor !== f.actor) return false;
      if (f.action && e.action !== f.action) return false;
      if (f.tenant && e.merchantId !== f.tenant) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !e.actor.toLowerCase().includes(q) &&
          !e.action.toLowerCase().includes(q) &&
          !actionLabel(e.action).toLowerCase().includes(q) &&
          !e.entityId.toLowerCase().includes(q)
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
      sorting: [{ id: "timestamp", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const resetPage = () => table.setPageIndex(0);

  return (
    <div className="flex flex-col gap-6">
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
          searchPlaceholder="ค้นหาผู้กระทำ, การกระทำ, ทรัพยากร..."
          filters={[
            {
              label: "ผู้กระทำ",
              value: actor,
              onChange: (v) => {
                setActor(v);
                resetPage();
              },
              options: distinctActors(AUDIT_LOG).map((a) => ({
                value: a,
                label: a,
              })),
              widthClass: "w-full lg:w-[220px]",
            },
            {
              label: "การกระทำ",
              value: action,
              onChange: (v) => {
                setAction(v);
                resetPage();
              },
              options: distinctActions(AUDIT_LOG).map((a) => ({
                value: a,
                label: actionLabel(a),
              })),
              widthClass: "w-full lg:w-[200px]",
            },
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
          ]}
        />

        <p className="flex items-center gap-1.5 border-t border-[var(--divider)] px-5 py-3 text-xs text-grey-600">
          <Lock className="size-3.5 text-grey-500" />
          บันทึกการตรวจสอบเป็นแบบอ่านอย่างเดียว แก้ไข/ลบไม่ได้
        </p>

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
