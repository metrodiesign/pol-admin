"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { Merchant } from "@/types/merchant";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { Badge } from "@/components/ui/badge";
import "@/types/table-meta";

export const tenantColumns: ColumnDef<Merchant>[] = [
  {
    id: "spine",
    enableSorting: false,
    meta: { headClassName: "w-1.5 p-0", cellClassName: "w-1.5 p-0" },
    header: () => null,
    cell: () => (
      <div className="flex h-full items-stretch pl-1.5">
        {/* MerchantStatus มีค่าเดียว ("Active") — spine ไม่มีอะไรให้ต่างสี, คง "ok" ตายตัว (REQ-3.3) */}
        <StatusSpine tone="ok" />
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "บริษัท",
    enableSorting: true,
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-data text-xs font-semibold text-grey-600">
            {t.code}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {t.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "legalEntityId",
    header: "นิติบุคคล",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{row.original.legalEntityId}</span>
    ),
  },
  {
    accessorKey: "saqScope",
    header: "ขอบเขต SAQ",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.saqScope}
      </Badge>
    ),
  },
  {
    id: "enabledPsps",
    header: "PSP ที่เปิดใช้",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.enabledPsps.map((p) => (
          <Badge key={p} variant="secondary" className="text-xs uppercase">
            {p}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "adminCount",
    header: "ผู้ดูแล",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-sm text-foreground">
        {row.original.adminCount}
      </span>
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
