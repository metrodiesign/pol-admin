"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import type { ApiClient } from "@/types/control/api-client";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { STATUS_LABEL, statusTone, scopeLabel } from "@/lib/control/api-client";
import { formatDateTime } from "@/lib/control/format";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { RowActionLink, RowActions } from "@/components/control/shared/row-action";
import { controlBadgeClass } from "@/components/control/shared/styles";
import { Badge } from "@/components/ui/badge";
import "@/types/table-meta";

const SCOPE_CAP = 3;

export const apiClientColumns: ColumnDef<ApiClient>[] = [
  {
    accessorKey: "name",
    header: "ไคลเอนต์",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">
          {row.original.name}
        </span>
        <span className="text-data text-xs text-grey-600">
          {row.original.clientId}
        </span>
      </div>
    ),
  },
  {
    id: "scopes",
    header: "ขอบเขต",
    enableSorting: false,
    cell: ({ row }) => {
      const scopes = row.original.scopes;
      const shown = scopes.slice(0, SCOPE_CAP);
      const extra = scopes.length - shown.length;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {shown.map((s) => (
            <Badge key={s} variant="outline" className={controlBadgeClass} title={scopeLabel(s)}>
              {s}
            </Badge>
          ))}
          {extra > 0 ? (
            <Badge variant="outline" className={`${controlBadgeClass} text-grey-600`}>
              +{extra}
            </Badge>
          ) : null}
        </div>
      );
    },
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
    accessorKey: "lastUsedAt",
    header: "ใช้งานล่าสุด",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-600">
        {formatDateTime(row.original.lastUsedAt)}
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
          href={`/control/api-clients/read?id=${row.original.id}`}
          label="ดูรายละเอียด"
          icon={<Eye className="size-5" />}
        />
      </RowActions>
    ),
  },
];
