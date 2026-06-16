"use client";

import "@/types/table-meta";
import type { ColumnDef } from "@tanstack/react-table";
import type { Notification } from "@/lib/mock/notifications";
import { StatusBadge } from "@/components/payment/status-badge";
import { MessageSquare, Mail, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


function formatSentAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
}

export const notifColumns: ColumnDef<Notification>[] = [
  {
    id: "type",
    accessorKey: "type",
    enableSorting: false,
    header: "ประเภท",
    cell: ({ row }) => {
      const isSms = row.original.type === "sms";
      return (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-[30px] shrink-0 items-center justify-center rounded-lg",
              isSms
                ? "bg-success/10 text-success-dark"
                : "bg-primary/10 text-primary",
            )}
          >
            {isSms ? (
              <MessageSquare className="size-3.5" strokeWidth={1.75} />
            ) : (
              <Mail className="size-3.5" strokeWidth={1.75} />
            )}
          </div>
          <span className="text-sm font-semibold uppercase">
            {row.original.type}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "recipient",
    enableSorting: false,
    header: "ผู้รับ",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.recipient}</span>
    ),
  },
  {
    accessorKey: "subject",
    enableSorting: false,
    header: "หัวเรื่อง / Template",
    cell: ({ row }) => {
      const n = row.original;
      return (
        <div>
          <div className="text-sm">{n.subject}</div>
          <div className="mt-0.5 font-mono text-xs text-grey-500">
            {n.templateId}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "orig",
    enableSorting: false,
    header: "จาก Originator",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
        {row.original.orig}
      </span>
    ),
  },
  {
    accessorKey: "status",
    enableSorting: true,
    header: "สถานะ",
    cell: ({ row }) => {
      const s = row.original.status;
      const variant =
        s === "sent" ? "sent" : s === "queued" ? "queued" : "failed";
      return <StatusBadge status={variant} />;
    },
  },
  {
    accessorKey: "sentAt",
    enableSorting: true,
    header: "เวลา",
    cell: ({ row }) => (
      <span className="text-sm text-grey-500 tabular-nums">
        {formatSentAt(row.original.sentAt)}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    size: 96,
    cell: ({ row, table }) => (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-grey-500 hover:text-foreground"
          title="ส่งซ้ำ"
          onClick={(e) => {
            e.stopPropagation();
            table.options.meta?.onResend?.(row.original);
          }}
          aria-label="ส่งซ้ำ"
        >
          <RefreshCw className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-grey-500 hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            table.options.meta?.onRowClick?.(row.original);
          }}
          aria-label="ดูรายละเอียด"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    ),
  },
];
