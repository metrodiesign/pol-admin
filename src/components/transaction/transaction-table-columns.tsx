"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { PaymentSession } from "@/types/order-payment";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/types/money";
import { CHANNEL_LABEL, CHANNEL_DOT, customerPhone, orderLikeStatus } from "@/lib/transaction";
import { TransactionListStatusBadge } from "@/components/transaction/transaction-list-status-badge";
import { Eye, Pencil, Copy, Trash2 } from "lucide-react";

interface BuildColumnsArgs {
  onSelect?: (t: PaymentSession) => void;
  onRead?: (t: PaymentSession) => void;
}

export function buildTransactionColumns({
  onSelect: _onSelect,
  onRead,
}: BuildColumnsArgs): ColumnDef<PaymentSession>[] {
  return [
  {
    id: "select",
    enableSorting: false,
    meta: {
      headClassName: "w-12 pl-1 pr-0 py-2",
      cellClassName: "w-12 pl-1 pr-0",
      ignoreRowClick: true,
    },
    header: ({ table }) => (
      <Checkbox
        className="justify-end"
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
        className="justify-end"
        checked={row.getIsSelected()}
        onChange={(c) => row.toggleSelected(c)}
        aria-label={`เลือก ${row.original.code}`}
      />
    ),
  },
  {
    accessorKey: "time",
    header: "วันที่ทำรายการ",
    enableSorting: true,
    meta: { headClassName: "w-[180px]", cellClassName: "w-[180px]" },
    // ponytail: time เก็บแค่ "HH:MM" ไม่มี date จริงในโมเดล — mock ทั้งหมดคือรายการ "วันนี้" (เหมือน order-table-columns.tsx)
    cell: ({ row }) => (
      <span className="text-sm text-grey-600">
        {row.original.time ? `30 ก.ค. 2569 ${row.original.time}` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "code",
    header: "รหัสธุรกรรม",
    enableSorting: true,
    meta: { headClassName: "w-[220px]", cellClassName: "w-[220px]" },
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            {t.code.replace(/^ORD/, "VCP")}
          </span>
          <span className="font-semibold text-primary">
            {t.subItems > 1 ? `${t.subItems} รายการย่อย` : "1 รายการ"}
          </span>
        </div>
      );
    },
  },
  {
    id: "source",
    header: "ผู้เอาประกันภัย",
    enableSorting: false,
    cell: ({ row }) => {
      const t = row.original;
      const s = t.source;
      return (
        <div className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{s.label}</span>
          <span className="text-xs text-grey-500">{customerPhone(t)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    header: "ช่องทางชำระเงิน",
    enableSorting: false,
    meta: { headClassName: "w-[200px]", cellClassName: "w-[200px]" },
    cell: ({ row }) => {
      const c = row.original.channel;
      return (
        <span className="inline-flex items-center gap-2 text-sm text-foreground">
          <span className={cn("size-3 rounded-full", CHANNEL_DOT[c])} />
          {CHANNEL_LABEL[c]}
        </span>
      );
    },
  },
  {
    id: "amount",
    header: "ยอดชำระเงิน",
    enableSorting: true,
    accessorFn: (t) => Number(t.amount.amount),
    meta: { headClassName: "w-[180px] text-right", cellClassName: "w-[180px] text-right" },
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">
        {formatMoney(row.original.amount).replace(` ${row.original.amount.currency}`, "")}
      </span>
    ),
  },
  {
    id: "status",
    header: "สถานะ",
    enableSorting: true,
    accessorFn: (t) => orderLikeStatus(t.status),
    meta: { headClassName: "w-[140px]", cellClassName: "w-[140px]" },
    cell: ({ row }) => <TransactionListStatusBadge status={orderLikeStatus(row.original.status)} />,
  },
  {
    id: "actions",
    enableSorting: false,
    meta: { headClassName: "w-[220px]", cellClassName: "w-[220px]", ignoreRowClick: true },
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
                aria-label="ดูรายละเอียด"
                onClick={() => onRead?.(row.original)}
              >
                <Eye className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ดูรายละเอียด</TooltipContent>
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
