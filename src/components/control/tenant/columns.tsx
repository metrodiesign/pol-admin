"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import type { Merchant } from "@/types/merchant";
import { RowActionLink, RowActions } from "@/components/control/shared/row-action";
import { controlBadgeClass } from "@/components/control/shared/styles";
import { Badge } from "@/components/ui/badge";
import "@/types/table-meta";

export const tenantColumns: ColumnDef<Merchant>[] = [
  {
    accessorKey: "code",
    header: "บริษัท",
    enableSorting: true,
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {t.name}
          </span>
          <span className="text-data text-xs font-semibold text-grey-600">
            {t.code}
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
      <Badge variant="outline" className={controlBadgeClass}>
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
          <Badge key={p} variant="secondary" className={`${controlBadgeClass} uppercase`}>
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
    id: "actions",
    enableSorting: false,
    meta: { headClassName: "w-20", cellClassName: "w-20", ignoreRowClick: true },
    header: () => null,
    cell: ({ row }) => (
      <RowActions>
        <RowActionLink
          href={`/control/tenants/read?id=${row.original.code}`}
          label="ดูรายละเอียด"
          icon={<Eye className="size-5" />}
        />
      </RowActions>
    ),
  },
];
