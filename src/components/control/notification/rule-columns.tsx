"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { NotificationRule } from "@/types/control/notification";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { CHANNEL_LABEL, eventLabel } from "@/lib/control/notification";
import { controlBadgeClass } from "@/components/control/shared/styles";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import "@/types/table-meta";

/**
 * Factory: the rules table needs a per-row toggle handler. The rule's enabled
 * state is read from `row.original` (driven by the shared store), so the column
 * stays stateless; closing over `onToggle` keeps the handler off table.options.meta
 * (which is shared/typed elsewhere) and the toggle column self-contained.
 */
export function buildNotificationRuleColumns(
  onToggle: (id: string, current: boolean) => void,
): ColumnDef<NotificationRule>[] {
  return [
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
        <Badge variant="secondary" className={controlBadgeClass}>{CHANNEL_LABEL[row.original.channel]}</Badge>
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
      id: "threshold",
      header: "เงื่อนไข",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.threshold ? (
          <span className="text-data text-xs text-grey-600">
            {row.original.threshold}
          </span>
        ) : (
          <span className="text-grey-500">—</span>
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
      id: "enabled",
      header: "ใช้งาน",
      enableSorting: false,
      meta: { headClassName: "w-20", cellClassName: "w-20", ignoreRowClick: true },
      cell: ({ row }) => {
        const { id, enabled } = row.original;
        return (
          <Switch
            checked={enabled}
            onCheckedChange={() => onToggle(id, enabled)}
          />
        );
      },
    },
  ];
}
