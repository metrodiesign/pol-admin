"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import type { NotificationLogEntry } from "@/types/control/notification";
import {
  CHANNEL_LABEL,
  LOG_STATUS_LABEL,
  eventLabel,
  logTone,
} from "@/lib/control/notification";
import { formatDateTime } from "@/lib/control/format";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { RowActionLink, RowActions } from "@/components/control/shared/row-action";
import { Badge } from "@/components/ui/badge";
import "@/types/table-meta";

export const notificationLogColumns: ColumnDef<NotificationLogEntry>[] = [
  {
    accessorKey: "event",
    header: "เหตุการณ์",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">
        {eventLabel(row.original.event)}
      </span>
    ),
  },
  {
    accessorKey: "channel",
    header: "ช่องทาง",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant="secondary">{CHANNEL_LABEL[row.original.channel]}</Badge>
    ),
  },
  {
    accessorKey: "target",
    header: "ปลายทาง",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-700">
        {row.original.target}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    enableSorting: true,
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={logTone(row.original.status)}
        label={LOG_STATUS_LABEL[row.original.status]}
      />
    ),
  },
  {
    accessorKey: "sentAt",
    header: "ส่งเมื่อ",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-600">
        {formatDateTime(row.original.sentAt)}
      </span>
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
          href={`/control/notifications/read?id=${row.original.id}`}
          label="ดูรายละเอียด"
          icon={<Eye className="size-5" />}
        />
      </RowActions>
    ),
  },
];
