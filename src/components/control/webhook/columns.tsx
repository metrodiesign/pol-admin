"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2, RotateCw, ShieldAlert, ShieldCheck } from "lucide-react";
import type { WebhookEvent } from "@/types/control/webhook-event";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import {
  PSP_LABEL,
  DELIVERY_LABEL,
  deliveryTone,
} from "@/lib/control/webhook";
import { formatDateTime } from "@/lib/control/format";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import {
  RowActionButton,
  RowActionLink,
  RowActions,
} from "@/components/control/shared/row-action";
import { Badge } from "@/components/ui/badge";
import "@/types/table-meta";

/**
 * Columns factory for the webhook events table. Closes over an `onReplay`
 * handler and the Set of in-flight (replaying) event ids so the Replay cell can
 * disable + spin per-row without the table owning that state.
 */
export function webhookColumns({
  onReplay,
  replaying,
}: {
  onReplay: (event: WebhookEvent) => void;
  replaying: Set<string>;
}): ColumnDef<WebhookEvent>[] {
  return [
    {
      accessorKey: "id",
      header: "เหตุการณ์",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {row.original.eventType}
          </span>
          <span className="text-data text-xs text-grey-700">
            {row.original.id}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "psp",
      header: "PSP",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
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
          {MERCHANT_LABEL[row.original.merchantId]}
        </span>
      ),
    },
    {
      accessorKey: "attempts",
      header: "ครั้งที่ส่ง",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-data text-xs text-grey-600">
          {row.original.attempts}
        </span>
      ),
    },
    {
      accessorKey: "signatureVerified",
      header: "ลายเซ็น",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.signatureVerified ? (
          <Badge
            variant="outline"
            className="border-success/40 text-success-dark"
          >
            <ShieldCheck className="size-3 text-success" />
            ยืนยันแล้ว
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-warning/40 text-warning-dark"
          >
            <ShieldAlert className="size-3 text-warning" />
            ไม่ผ่าน
          </Badge>
        ),
    },
    {
      accessorKey: "receivedAt",
      header: "รับเมื่อ",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-data text-xs text-grey-600">
          {formatDateTime(row.original.receivedAt)}
        </span>
      ),
    },
    {
      accessorKey: "deliveryStatus",
      header: "สถานะ",
      enableSorting: true,
      cell: ({ row }) => (
        <ControlStatusBadge
          tone={deliveryTone(row.original.deliveryStatus)}
          label={DELIVERY_LABEL[row.original.deliveryStatus]}
        />
      ),
    },
    {
      id: "actions",
      header: () => null,
      enableSorting: false,
      meta: { headClassName: "w-28", cellClassName: "w-28", ignoreRowClick: true },
      cell: ({ row }) => {
        const e = row.original;
        const inFlight = replaying.has(e.id);
        const isDelivered = e.deliveryStatus === "delivered";
        return (
          <RowActions>
            <RowActionButton
              label={inFlight ? "กำลังส่ง..." : "ส่งซ้ำ"}
              tooltip={isDelivered ? "ส่งสำเร็จแล้ว ไม่ต้องส่งซ้ำ" : undefined}
              icon={
                inFlight ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <RotateCw className="size-5" />
                )
              }
              disabled={isDelivered || inFlight}
              onClick={() => onReplay(e)}
            />
            <RowActionLink
              href={`/control/webhooks/read?id=${e.id}`}
              label="ดูรายละเอียด"
              icon={<Eye className="size-5" />}
            />
          </RowActions>
        );
      },
    },
  ];
}
