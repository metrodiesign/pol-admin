"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { Originator } from "@/types/originator";
import { TENANT_LABEL } from "@/lib/mock/tenants";
import { TYPE_LABEL, STATUS_LABEL, statusTone } from "@/lib/control/originator";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import { Badge } from "@/components/ui/badge";
import "@/types/table-meta";

export const originatorColumns: ColumnDef<Originator>[] = [
  {
    id: "spine",
    enableSorting: false,
    meta: { headClassName: "w-1.5 p-0", cellClassName: "w-1.5 p-0" },
    header: () => null,
    cell: ({ row }) => (
      <div className="flex h-full items-stretch pl-1.5">
        <StatusSpine tone={statusTone(row.original.status)} />
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Originator",
    enableSorting: true,
    cell: ({ row }) => {
      const o = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-data text-xs font-medium text-grey-700">
            {o.code}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {o.name}
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
        {TENANT_LABEL[row.original.tenantId]}
      </span>
    ),
  },
  {
    accessorKey: "linkedApiClientId",
    header: "API client",
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
    id: "chevron",
    enableSorting: false,
    meta: { headClassName: "w-12", cellClassName: "w-12", ignoreRowClick: true },
    header: () => null,
    cell: () => <ChevronRight className="size-4 text-grey-500" />,
  },
];
