"use client";

import "@/types/table-meta";
import type { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/types/transaction";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/payment/status-badge";
import { ChannelTag } from "@/components/payment/channel-tag";
import { MiniLifecycle } from "@/components/payment/mini-lifecycle";
import { statusToMiniStates } from "./lifecycle-utils";
import { ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatTHB(amount: number): string {
  return new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export const txnColumns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    enableSorting: false,
    size: 48,
    meta: { headClassName: "w-12 pl-1 pr-0", cellClassName: "w-12 pl-1 pr-0" },
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
        aria-label="เลือกทั้งหมด"
      />
    ),
    cell: ({ row }) => (
      <span onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(checked) => row.toggleSelected(checked)}
          aria-label={`เลือก ${row.original.id}`}
        />
      </span>
    ),
  },
  {
    accessorKey: "id",
    enableSorting: true,
    header: "รหัสธุรกรรม",
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div>
          <div className="font-mono text-sm font-semibold">{t.id}</div>
          <div className="text-xs text-grey-500 mt-0.5 flex items-center gap-1">
            {t.itemCount > 1 ? (
              <>
                <List className="size-3 inline-block" />
                {t.itemCount} รายการย่อย
              </>
            ) : (
              "1 รายการ"
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    enableSorting: true,
    sortingFn: (a, b) =>
      a.original.customer.name.localeCompare(b.original.customer.name, "th"),
    header: "ลูกค้า",
    cell: ({ row }) => {
      const c = row.original.customer;
      return (
        <div>
          <div className="text-sm font-semibold">{c.name}</div>
          <div className="text-xs text-grey-500 mt-0.5">{c.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "originator",
    enableSorting: false,
    header: "ที่มา",
    cell: ({ row }) => {
      const o = row.original.originator;
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
            {o.code}
          </span>
          <span className="text-sm">{o.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    enableSorting: false,
    header: "ช่องทาง",
    cell: ({ row }) => <ChannelTag channel={row.original.channel} />,
  },
  {
    accessorKey: "psp",
    enableSorting: false,
    header: "PSP",
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.psp}</span>
    ),
  },
  {
    accessorKey: "amount",
    enableSorting: true,
    header: "จำนวน",
    meta: { headClassName: "text-right" },
    cell: ({ row }) => (
      <div className="text-right font-bold tabular-nums text-sm">
        ฿{formatTHB(row.original.amount)}
      </div>
    ),
  },
  {
    id: "lifecycle",
    enableSorting: false,
    header: "Lifecycle",
    cell: ({ row }) => (
      <MiniLifecycle states={statusToMiniStates(row.original.status)} />
    ),
  },
  {
    accessorKey: "status",
    enableSorting: true,
    header: "สถานะ",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "ts",
    enableSorting: true,
    header: "เวลา",
    cell: ({ row }) => {
      const d = new Date(row.original.ts);
      return (
        <span className="text-sm text-grey-500 tabular-nums">
          {d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
        </span>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    size: 48,
    cell: ({ row, table }) => (
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("text-grey-500 hover:text-foreground")}
        onClick={(e) => {
          e.stopPropagation();
          table.options.meta?.onRowClick?.(row.original);
        }}
        aria-label="ดูรายละเอียด"
      >
        <ChevronRight className="size-4" />
      </Button>
    ),
  },
];
