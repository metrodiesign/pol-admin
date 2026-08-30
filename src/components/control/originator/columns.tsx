"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import type { Originator } from "@/types/control/originator";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { TYPE_LABEL, STATUS_LABEL, statusTone } from "@/lib/control/originator";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { RowActionLink, RowActions } from "@/components/control/shared/row-action";
import { Badge } from "@/components/ui/badge";
import "@/types/table-meta";

export const originatorColumns: ColumnDef<Originator>[] = [
  {
    accessorKey: "code",
    header: "ต้นทาง",
    enableSorting: true,
    cell: ({ row }) => {
      const o = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {o.name}
          </span>
          <span className="text-data text-xs font-medium text-grey-700">
            {o.code}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "ประเภท",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant="outline">{TYPE_LABEL[row.original.type]}</Badge>
    ),
  },
  {
    id: "tenant",
    header: "บริษัท",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {MERCHANT_LABEL[row.original.merchantId]}
      </span>
    ),
  },
  {
    accessorKey: "linkedApiClientId",
    header: "ไคลเอนต์ API",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-700">
        {row.original.linkedApiClientId ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    enableSorting: true,
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={statusTone(row.original.status)}
        label={STATUS_LABEL[row.original.status]}
      />
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
          href={`/control/originators/read?id=${row.original.id}`}
          label="ดูรายละเอียด"
          icon={<Eye className="size-5" />}
        />
      </RowActions>
    ),
  },
];
