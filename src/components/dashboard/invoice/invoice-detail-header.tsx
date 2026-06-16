"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Eye, CloudDownload, Printer, Send, Share2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MinimalsInvoiceStatus } from "@/lib/mock/invoice-minimals";

const STATUS_OPTIONS: MinimalsInvoiceStatus[] = ["paid", "pending", "overdue", "draft"];
const STATUS_LABELS: Record<MinimalsInvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  draft: "Draft",
};

interface InvoiceDetailHeaderProps {
  invoiceNumber: string;
  initialStatus: MinimalsInvoiceStatus;
}

export function InvoiceDetailHeader({ invoiceNumber, initialStatus }: InvoiceDetailHeaderProps) {
  const [status, setStatus] = useState<MinimalsInvoiceStatus>(initialStatus);
  const statusId = useId();

  return (
    <div className="mb-5">
      {/* Breadcrumb heading */}
      <h4 className="text-2xl font-bold leading-9 text-foreground">{invoiceNumber}</h4>
      <nav aria-label="breadcrumb" className="mt-1">
        <ol className="flex flex-wrap items-center text-sm text-grey-600">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Invoice", href: "/dashboard/invoice/list" },
            { label: invoiceNumber },
          ].map((crumb, i, arr) => (
            <li key={i} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="mx-2 inline-block size-1 rounded-full bg-grey-500" />
              )}
              {i < arr.length - 1 && crumb.href ? (
                <Link href={crumb.href} className="text-grey-600 hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-grey-600">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Toolbar row: icon actions (left) + status select (right) */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
            aria-label="View"
          >
            <Eye className="size-5" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
            aria-label="Download"
          >
            <CloudDownload className="size-5" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
            aria-label="Print"
          >
            <Printer className="size-5" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
            aria-label="Send"
          >
            <Send className="size-5" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
            aria-label="Share"
          >
            <Share2 className="size-5" />
          </button>
        </div>

        {/* Status select */}
        <div className="flex shrink-0 flex-col gap-1">
          <label id={statusId} className="text-xs font-medium text-grey-500">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as MinimalsInvoiceStatus)}>
            <SelectTrigger aria-labelledby={statusId} className="w-40 text-sm font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
