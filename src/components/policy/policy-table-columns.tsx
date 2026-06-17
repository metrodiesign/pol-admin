"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck } from "lucide-react";
import "@/types/table-meta";
import type { Policy, PremiumFrequency } from "@/types/policy";
import { formatTHB, formatThaiShortDate } from "@/lib/utils";
import { PolicyStatusBadge } from "./policy-status-badge";
import { PolicyRowActions } from "./policy-row-actions";

const FREQUENCY_LABEL: Record<PremiumFrequency, string> = {
  monthly: "รายเดือน",
  quarterly: "ราย 3 เดือน",
  yearly: "รายปี",
};

export const policyColumns: ColumnDef<Policy>[] = [
  {
    id: "policyNo",
    accessorFn: (p) => p.id,
    header: "เลขกรมธรรม์",
    enableSorting: true,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="min-w-0">
          <span className="block text-sm font-bold text-foreground">{p.id}</span>
          <span className="block text-xs text-grey-500">
            เริ่มคุ้มครอง {formatThaiShortDate(p.effectiveDate)}
          </span>
        </div>
      );
    },
  },
  {
    id: "customer",
    header: "ลูกค้า",
    enableSorting: false,
    cell: ({ row }) => {
      const c = row.original.customer;
      return (
        <div className="min-w-0">
          <span className="block truncate text-sm text-foreground">{c.name}</span>
          <span className="block truncate text-xs text-grey-500">{c.phone}</span>
        </div>
      );
    },
  },
  {
    id: "product",
    header: "ประเภท / แผน",
    enableSorting: false,
    cell: ({ row }) => {
      const prod = row.original.product;
      return (
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-grey-500" aria-hidden />
          <div className="min-w-0">
            <span className="block text-sm text-foreground">{prod.type}</span>
            {prod.plan ? (
              <span className="block text-xs text-grey-500">{prod.plan}</span>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    id: "sumInsured",
    accessorFn: (p) => p.sumInsured,
    header: "ทุนประกัน",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {formatTHB(row.original.sumInsured, 0)}
      </span>
    ),
  },
  {
    id: "premium",
    accessorFn: (p) => p.premium,
    header: "เบี้ย / งวด",
    enableSorting: true,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="min-w-0">
          <span className="block text-sm font-bold text-foreground">
            {formatTHB(p.premium, 2)}
          </span>
          <span className="block text-xs text-grey-500">{FREQUENCY_LABEL[p.frequency]}</span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "สถานะ",
    enableSorting: false,
    cell: ({ row }) => <PolicyStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: () => null,
    enableSorting: false,
    meta: { headClassName: "w-56", cellClassName: "w-56", ignoreRowClick: true },
    cell: ({ row, table }) => (
      <PolicyRowActions policy={row.original} cart={table.options.meta?.cart} />
    ),
  },
];
