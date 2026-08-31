"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ShieldAlert } from "lucide-react";
import type { RoutingRule } from "@/types/control/routing-rule";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { useControlStore } from "@/lib/control/store";
import { routingStore, toggleRule, moveRule } from "@/lib/control/routing-store";
import { showControlToast } from "@/components/control/shared/toast";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/table/data-table";
import { ControlToolbar } from "@/components/control/shared/toolbar";
import { routingColumns } from "./table-columns";
import "@/types/table-meta";

/** Sort by priority ascending, then by id for a stable order within a tenant. */
function byPriority(a: RoutingRule, b: RoutingRule): number {
  return a.priority - b.priority || a.id.localeCompare(b.id);
}

export function RoutingRulesView() {
  const router = useRouter();
  const rules = useControlStore(routingStore);
  const [tenant, setTenant] = useState("");
  const [dense, setDense] = useState(false);

  const globalFilter = useMemo(() => ({ tenant }), [tenant]);

  const columns = useMemo(
    () =>
      routingColumns({
        onMoveUp: (r) => moveRule(r.id, "up"),
        onMoveDown: (r) => moveRule(r.id, "down"),
        onToggle: (r) => {
          toggleRule(r.id);
          showControlToast(
            r.enabled ? "ปิดใช้งานกฎแล้ว" : "เปิดใช้งานกฎแล้ว",
            "ok",
          );
        },
      }),
    [],
  );

  const sortedRules = useMemo(() => [...rules].sort(byPriority), [rules]);

  const table = useDataTable<RoutingRule>({
    data: sortedRules,
    columns,
    getRowId: (r) => r.id,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    state: { globalFilter },
    meta: {
      onRowClick: (r) => router.push(`/control/routing/read?id=${r.id}`),
    },
    globalFilterFn: (row, _id, value) => {
      const f = value as { tenant: string };
      if (f.tenant && row.original.merchantId !== f.tenant) return false;
      return true;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/8 px-5 py-4">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-dark" />
        <p className="text-sm font-medium text-warning-dark">
          การเปลี่ยนแปลง routing ต้องผ่านการอนุมัติแบบ maker-checker (Approvals)
        </p>
      </div>

      <div
        className="overflow-hidden rounded-2xl bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <ControlToolbar
          filters={[
            {
              label: "บริษัท",
              value: tenant,
              onChange: setTenant,
              options: Object.entries(MERCHANT_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            },
          ]}
        />
        <DataTable table={table} dense={dense} onDenseChange={setDense} hidePagination />
      </div>
    </div>
  );
}
