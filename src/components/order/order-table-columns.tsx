"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Order } from "@/types/order-payment";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatTHB } from "@/lib/utils";
import { CHANNEL_LABEL, CHANNEL_DOT, PSP_LABEL } from "@/lib/order";
import { OrderLifecycle } from "./order-lifecycle";
import { OrderStatusBadge } from "./order-status-badge";
import { Eye, Pencil, Copy, Trash2, Menu } from "lucide-react";

interface BuildColumnsArgs {
  onSelect?: (t: Order) => void;
  onRead?: (t: Order) => void;
}

export function buildOrderColumns({
  onSelect: _onSelect,
  onRead,
}: BuildColumnsArgs): ColumnDef<Order>[] {
  return [
  {
    id: "select",
    enableSorting: false,
    meta: { headClassName: "w-12 pl-1 pr-0", cellClassName: "w-12 pl-1 pr-0" },
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={
          table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        onChange={(c) => table.toggleAllRowsSelected(c)}
        aria-label="เลือกทั้งหมด"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(c) => row.toggleSelected(c)}
        aria-label={`เลือก ${row.original.code}`}
      />
    ),
  },
  {
    accessorKey: "code",
    header: "รหัสธุรกรรม",
    enableSorting: true,
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            {t.code}
          </span>
          <span className="text-xs text-grey-500">
            <Menu className="mr-1 inline size-3.5" />
            {t.subItems > 1 ? `${t.subItems} รายการย่อย` : "1 รายการ"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "ลูกค้า",
    enableSorting: true,
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="min-w-0">
          <span className="block truncate text-sm text-foreground">
            {t.customerName}
          </span>
          <span className="block truncate text-sm text-grey-500">
            {t.customerEmail}
          </span>
        </div>
      );
    },
  },
  {
    id: "source",
    header: "ที่มา",
    enableSorting: false,
    cell: ({ row }) => {
      const s = row.original.source;
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-md bg-grey-200 px-1.5 text-xs font-bold text-grey-700">
            {s.code}
          </span>
          <span className="text-sm text-foreground">{s.label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    header: "ช่องทาง",
    enableSorting: false,
    cell: ({ row }) => {
      const c = row.original.channel;
      return (
        <span className="inline-flex items-center gap-2 text-sm text-foreground">
          <span className={cn("size-2 rounded-full", CHANNEL_DOT[c])} />
          {CHANNEL_LABEL[c]}
        </span>
      );
    },
  },
  {
    accessorKey: "psp",
    header: "PSP",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {PSP_LABEL[row.original.psp]}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "จำนวน",
    enableSorting: true,
    meta: { headClassName: "text-right", cellClassName: "text-right" },
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">
        {formatTHB(row.original.amount, 2)}
      </span>
    ),
  },
  {
    id: "lifecycle",
    header: "วงจร",
    enableSorting: false,
    cell: ({ row }) => <OrderLifecycle status={row.original.status} />,
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    enableSorting: true,
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "time",
    header: "เวลา",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-sm text-grey-600">{row.original.time} น.</span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    meta: { headClassName: "w-48", cellClassName: "w-48", ignoreRowClick: true },
    header: () => null,
    cell: ({ row }) => (
      <TooltipProvider>
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label="ดู"
                onClick={() => onRead?.(row.original)}
              >
                <Eye className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ดู</TooltipContent>
          </Tooltip>
          {[
            { icon: Pencil, label: "แก้ไข" },
            { icon: Copy,   label: "คัดลอก" },
          ].map(({ icon: Icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger render={<span className="inline-flex" />}>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                  aria-label={label}
                >
                  <Icon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer text-error hover:bg-error/8 hover:text-error focus-visible:bg-error/8 focus-visible:text-error"
                aria-label="ลบ"
              >
                <Trash2 className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ลบ</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    ),
  },
  ];
}
