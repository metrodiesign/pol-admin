"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, ShieldCheck } from "lucide-react";
import type { PspConnection } from "@/types/psp-connection";
import { TENANT_LABEL } from "@/lib/mock/tenants";
import {
  PROVIDER_LABEL,
  ENV_LABEL,
  HEALTH_LABEL,
  healthTone,
} from "@/lib/control/psp";
import { formatDateTime } from "@/lib/control/format";
import { cn } from "@/lib/utils";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { ControlStatusBadge } from "@/components/control/shared/control-status-badge";
import "@/types/table-meta";

export const pspColumns: ColumnDef<PspConnection>[] = [
  {
    id: "spine",
    enableSorting: false,
    meta: { headClassName: "w-1.5 p-0", cellClassName: "w-1.5 p-0" },
    header: () => null,
    cell: ({ row }) => (
      <div className="flex h-full items-stretch pl-1.5">
        <StatusSpine tone={healthTone(row.original.health)} />
      </div>
    ),
  },
  {
    accessorKey: "provider",
    header: "PSP",
    enableSorting: true,
    cell: ({ row }) => {
      const p = row.original;
      const isLive = p.environment === "live";
      return (
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-foreground">
            {PROVIDER_LABEL[p.provider]}
          </span>
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-md px-1.5 text-xs font-bold",
              isLive
                ? "bg-success/16 text-success-dark"
                : "bg-grey-500/16 text-grey-600",
            )}
          >
            {ENV_LABEL[p.environment]}
          </span>
        </div>
      );
    },
  },
  {
    id: "redirect",
    header: "โหมด",
    enableSorting: false,
    cell: () => (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-grey-700">
        <ShieldCheck className="size-3.5 text-success" />
        Redirect-only · SAQ A
      </span>
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
    accessorKey: "publicKey",
    header: "คีย์สาธารณะ",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-700">
        {row.original.publicKey}
      </span>
    ),
  },
  {
    accessorKey: "lastWebhookAt",
    header: "Webhook ล่าสุด",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-data text-xs text-grey-600">
        {formatDateTime(row.original.lastWebhookAt)}
      </span>
    ),
  },
  {
    accessorKey: "health",
    header: "สถานะ",
    enableSorting: true,
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={healthTone(row.original.health)}
        label={HEALTH_LABEL[row.original.health]}
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
