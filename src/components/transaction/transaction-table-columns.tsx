"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/types/transaction";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatTHB } from "@/lib/utils";
import { CHANNEL_LABEL, CHANNEL_DOT, PSP_LABEL } from "@/lib/transaction";
import { TransactionLifecycle } from "./transaction-lifecycle";
import { TransactionStatusBadge } from "./transaction-status-badge";
import { ChevronRight, Menu } from "lucide-react";

export const transactionColumns: ColumnDef<Transaction>[] = [
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
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(c) => row.toggleSelected(c)}
        aria-label={`Select ${row.original.code}`}
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
    header: "LIFECYCLE",
    enableSorting: false,
    cell: ({ row }) => <TransactionLifecycle status={row.original.status} />,
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    enableSorting: true,
    cell: ({ row }) => <TransactionStatusBadge status={row.original.status} />,
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
    id: "chevron",
    enableSorting: false,
    meta: { headClassName: "w-12", cellClassName: "w-12", ignoreRowClick: true },
    header: () => null,
    cell: () => <ChevronRight className="size-4 text-grey-500" />,
  },
];
