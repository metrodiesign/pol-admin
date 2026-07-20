"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { AuditEntry } from "@/types/audit";
import { MERCHANT_LABEL } from "@/lib/mock/merchants";
import { RESULT_LABEL, resultTone, actionLabel } from "@/lib/control/audit";
import { formatDateTime } from "@/lib/control/format";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import "@/types/table-meta";

export const auditColumns: ColumnDef<AuditEntry>[] = [
  {
    id: "spine",
    enableSorting: false,
    meta: { headClassName: "w-1.5 p-0", cellClassName: "w-1.5 p-0" },
    header: () => null,
    cell: ({ row }) => (
      <div className="flex h-full items-stretch pl-1.5">
        <StatusSpine tone={resultTone(row.original.result)} />
      </div>
    ),
  },
  {
    accessorKey: "timestamp",
    header: "เวลา",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-600">
        {formatDateTime(row.original.timestamp)}
      </span>
    ),
  },
  {
    accessorKey: "actor",
    header: "ผู้กระทำ",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-700">
        {row.original.actor}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "การกระทำ",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">
          {actionLabel(row.original.action)}
        </span>
        <span className="text-data text-xs text-grey-500">
          {row.original.entityId}
        </span>
      </div>
    ),
  },
  {
    id: "tenant",
    header: "บริษัท",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {MERCHANT_LABEL[row.original.merchantId]}
      </span>
    ),
  },
  {
    accessorKey: "result",
    header: "ผลลัพธ์",
    enableSorting: true,
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={resultTone(row.original.result)}
        label={RESULT_LABEL[row.original.result]}
      />
    ),
  },
  {
    accessorKey: "ip",
    header: "IP",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-600">{row.original.ip}</span>
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
