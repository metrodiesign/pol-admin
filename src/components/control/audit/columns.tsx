"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import type { AuditEntry } from "@/types/control/audit";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { RESULT_LABEL, resultTone, actionLabel } from "@/lib/control/audit";
import { formatDateTime } from "@/lib/control/format";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { RowActionLink, RowActions } from "@/components/control/shared/row-action";
import "@/types/table-meta";

export const auditColumns: ColumnDef<AuditEntry>[] = [
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
    id: "actions",
    enableSorting: false,
    meta: { headClassName: "w-20", cellClassName: "w-20", ignoreRowClick: true },
    header: () => null,
    cell: ({ row }) => (
      <RowActions>
        <RowActionLink
          href={`/control/audit/read?id=${row.original.id}`}
          label="ดูรายละเอียด"
          icon={<Eye className="size-5" />}
        />
      </RowActions>
    ),
  },
];
