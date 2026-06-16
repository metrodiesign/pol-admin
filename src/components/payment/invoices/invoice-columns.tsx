"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Invoice } from "@/types/invoice";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/payment/status-badge";
import { ChannelTag } from "@/components/payment/channel-tag";
import { Copy, Eye, List } from "lucide-react";
import { formatTHBPlain } from "@/lib/utils";

const fmtTHB = formatTHBPlain;

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
  }).format(new Date(iso));
}

interface InvoiceActionsProps {
  invoice: Invoice;
  onView: (inv: Invoice) => void;
  onCopy: (inv: Invoice) => void;
}

function InvoiceActions({ invoice, onView, onCopy }: InvoiceActionsProps) {
  const hasActiveLink =
    invoice.url &&
    (invoice.status === "pending" ||
      invoice.status === "partial" ||
      invoice.status === "overdue");
  return (
    <div className="flex items-center gap-1">
      {hasActiveLink && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-grey-600 hover:text-foreground"
          aria-label="คัดลอกลิงก์"
          onClick={(e) => {
            e.stopPropagation();
            onCopy(invoice);
          }}
        >
          <Copy className="size-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-grey-600 hover:text-foreground"
        aria-label="ดูรายละเอียด"
        onClick={(e) => {
          e.stopPropagation();
          onView(invoice);
        }}
      >
        <Eye className="size-3.5" />
      </Button>
    </div>
  );
}

export function buildInvoiceColumns(
  onView: (inv: Invoice) => void,
  onCopy: (inv: Invoice) => void,
): ColumnDef<Invoice>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          aria-label="เลือกทั้งหมด"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(checked) => row.toggleSelected(checked)}
            aria-label={`เลือก ${row.original.id}`}
          />
        </div>
      ),
      enableSorting: false,
      size: 48,
      meta: { headClassName: "w-12 pl-1 pr-0", cellClassName: "w-12 pl-1 pr-0" },
    },
    {
      accessorKey: "id",
      header: "รหัสใบ / ลิงก์",
      cell: ({ row }) => {
        const inv = row.original;
        const shortUrl = inv.url ? inv.url.slice(-8) : null;
        const ref1 = inv.refs[0];
        const ref2 = inv.refs[1];
        return (
          <div className="min-w-0">
            <span className="block font-mono text-sm font-semibold text-foreground">
              {inv.id}
            </span>
            {shortUrl && (
              <span className="flex items-center gap-1 text-[12px] text-grey-500 truncate max-w-[180px]">
                <span className="font-mono">/i/{shortUrl}</span>
              </span>
            )}
            {(ref1 ?? ref2) && (
              <span className="block text-[12px] text-grey-500 font-mono">
                {ref1}{ref1 && ref2 ? " · " : ""}{ref2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "customer",
      header: "ลูกค้า",
      cell: ({ row }) => {
        const c = row.original.customer;
        return (
          <div className="min-w-0">
            <span className="block text-sm font-semibold">{c.name}</span>
            <span className="block text-[12px] text-grey-500">
              {c.phone || c.email || "—"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "originatorId",
      header: "ที่มา",
      cell: ({ row }) => {
        const code = row.original.originatorId;
        return (
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">
              {code.split("-")[0]}
            </span>
            <span className="text-sm text-grey-700 truncate max-w-[120px]">
              {code}
            </span>
          </span>
        );
      },
    },
    {
      accessorKey: "channel",
      header: "ช่องทาง",
      cell: ({ row }) => <ChannelTag channel={row.original.channel} />,
    },
    {
      id: "itemCount",
      header: () => <span className="block text-right w-full">รายการ</span>,
      cell: ({ row }) => (
        <span className="flex items-center justify-end gap-1 text-sm">
          <List className="size-3 text-grey-400" />
          {row.original.items.length}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "total",
      header: () => <span className="block text-right w-full">ยอดสุทธิ</span>,
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="text-right">
            <span className="block font-bold tabular-nums">
              ฿{fmtTHB(inv.total)}
            </span>
            {inv.discount > 0 && (
              <span className="block text-[12px] text-grey-500">
                ส่วนลด ฿{fmtTHB(inv.discount)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "ออกเมื่อ",
      cell: ({ row }) => (
        <span className="text-sm text-grey-600">
          {fmtDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "dueDate",
      header: "ครบกำหนด",
      cell: ({ row }) => (
        <span className="text-sm text-grey-600">
          {fmtDate(row.original.expiresAt)}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "สถานะ",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableSorting: false,
      size: 80,
      cell: ({ row }) => (
        <InvoiceActions
          invoice={row.original}
          onView={onView}
          onCopy={onCopy}
        />
      ),
    },
  ];
}
