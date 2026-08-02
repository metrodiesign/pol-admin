"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ReconciliationLine } from "@/types/control/reconciliation";
import type { OrderStatus } from "@/types/order-payment";
import { ORDER_STATUS_LABEL } from "@/lib/order";
import { formatTHB } from "@/lib/utils";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import type { Tone } from "@/lib/control/status";
import "@/types/table-meta";

const STATUS_TONE: Record<OrderStatus, Tone> = {
  AwaitingPayment: "warn",
  Paid: "ok",
  Cancelled: "muted",
};

export const reconciliationColumns: ColumnDef<ReconciliationLine>[] = [
  {
    accessorKey: "status",
    header: "สถานะ",
    enableSorting: true,
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={STATUS_TONE[row.original.status]}
        label={ORDER_STATUS_LABEL[row.original.status]}
      />
    ),
  },
  {
    accessorKey: "currency",
    header: "สกุลเงิน",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-700">
        {row.original.currency}
      </span>
    ),
  },
  {
    accessorKey: "count",
    header: "จำนวนรายการ",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-700">
        {row.original.count}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "ยอดรวม",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs font-semibold text-foreground">
        {formatTHB(row.original.total, 2)}
      </span>
    ),
  },
];
