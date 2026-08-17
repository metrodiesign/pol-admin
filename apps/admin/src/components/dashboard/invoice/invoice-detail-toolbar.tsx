"use client";

import { useId } from "react";
import Link from "next/link";
import {
  Pencil,
  Eye,
  CloudDownload,
  Printer,
  Send,
  Share2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MinimalsInvoiceStatus } from "@/lib/mock/invoice-minimals";

const STATUS_OPTIONS: MinimalsInvoiceStatus[] = ["paid", "pending", "overdue", "draft"];

const STATUS_LABELS: Record<MinimalsInvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  draft: "Draft",
};

interface InvoiceDetailToolbarProps {
  invoiceId: string;
  status: MinimalsInvoiceStatus;
}

export function InvoiceDetailToolbar({ status }: InvoiceDetailToolbarProps) {
  const statusId = useId();
  return (
    <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
      {/* Icon button row */}
      <div className="flex items-center gap-1">
        <Link
          href={`/minimals/invoice/edit`}
          className="rounded-full p-2 text-grey-500 hover:bg-grey-100 transition-colors"
          aria-label="Edit"
        >
          <Pencil className="size-5" />
        </Link>
        <button
          type="button"
          className="rounded-full p-2 text-grey-500 hover:bg-grey-100 transition-colors"
          aria-label="View"
        >
          <Eye className="size-5" />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-grey-500 hover:bg-grey-100 transition-colors"
          aria-label="Download"
        >
          <CloudDownload className="size-5" />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-grey-500 hover:bg-grey-100 transition-colors"
          aria-label="Print"
        >
          <Printer className="size-5" />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-grey-500 hover:bg-grey-100 transition-colors"
          aria-label="Send"
        >
          <Send className="size-5" />
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-grey-500 hover:bg-grey-100 transition-colors"
          aria-label="Share"
        >
          <Share2 className="size-5" />
        </button>
      </div>

      {/* Status select */}
      <div className="relative flex flex-col gap-1">
        <label id={statusId} className="text-xs font-medium text-grey-500">Status</label>
        <Select defaultValue={status}>
          <SelectTrigger
            aria-labelledby={statusId}
            className={cn("w-40 text-sm font-medium text-grey-800")}
          >
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
  );
}
