"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { SettlementBatch } from "@/types/settlement";
import { TENANT_LABEL } from "@/lib/mock/tenants";
import { PSP_LABEL, STATUS_LABEL, statusTone, variance } from "@/lib/control/settlement";
import { formatDateTime } from "@/lib/control/format";
import { cn, formatTHB } from "@/lib/utils";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import "@/types/table-meta";

/** Signed THB with a leading +/− and a tone color when non-zero. */
function VarianceCell({ batch }: { batch: SettlementBatch }) {
  const v = variance(batch);
  if (batch.matchStatus === "unreconciled") {
    return <span className="text-data text-xs text-grey-500">—</span>;
  }
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return (
    <span
      className={cn(
        "text-data text-xs font-semibold",
        v > 0 && "text-warning-dark",
        v < 0 && "text-error-dark",
        v === 0 && "text-grey-600",
      )}
    >
      {sign}
      {formatTHB(Math.abs(v), 2)}
    </span>
  );
}

export const settlementColumns: ColumnDef<SettlementBatch>[] = [
  {
    id: "spine",
    enableSorting: false,
    meta: { headClassName: "w-1.5 p-0", cellClassName: "w-1.5 p-0" },
    header: () => null,
    cell: ({ row }) => (
      <div className="flex h-full items-stretch pl-1.5">
        <StatusSpine tone={statusTone(row.original.matchStatus)} />
      </div>
    ),
  },
  {
    accessorKey: "batchRef",
    header: "Batch",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-700">
        {row.original.batchRef}
      </span>
    ),
  },
  {
    accessorKey: "psp",
    header: "PSP",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">
        {PSP_LABEL[row.original.psp]}
      </span>
    ),
  },
  {
    id: "tenant",
    header: "บริษัท",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {TENANT_LABEL[row.original.tenantId]}
      </span>
    ),
  },
  {
    accessorKey: "expected",
    header: "ยอดที่คาดไว้",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-700">
        {formatTHB(row.original.expected, 2)}
      </span>
    ),
  },
  {
    accessorKey: "reported",
    header: "ยอดที่ PSP แจ้ง",
    enableSorting: true,
    cell: ({ row }) =>
      row.original.matchStatus === "unreconciled" ? (
        <span className="text-data text-xs text-grey-500">—</span>
      ) : (
        <span className="text-data text-xs text-grey-700">
          {formatTHB(row.original.reported, 2)}
        </span>
      ),
  },
  {
    id: "variance",
    header: "ส่วนต่าง",
    enableSorting: false,
    cell: ({ row }) => <VarianceCell batch={row.original} />,
  },
  {
    accessorKey: "matchStatus",
    header: "สถานะ",
    enableSorting: true,
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={statusTone(row.original.matchStatus)}
        label={STATUS_LABEL[row.original.matchStatus]}
      />
    ),
  },
  {
    accessorKey: "settledAt",
    header: "Settle เมื่อ",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-600">
        {formatDateTime(row.original.settledAt)}
      </span>
    ),
  },
  {
    id: "chevron",
    enableSorting: false,
    meta: { headClassName: "w-12", cellClassName: "w-12", ignoreRowClick: true },
    header: () => null,
    cell: () => <ChevronRight className="size-4 text-grey-500" />,
  },
];
