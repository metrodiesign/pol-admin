"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, ShieldCheck } from "lucide-react";
import type { PspConnection } from "@/types/control/psp-connection";
import type { MerchantCode } from "@/types/merchant";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import {
  PROVIDER_LABEL,
  HEALTH_LABEL,
  healthTone,
} from "@/lib/control/psp";
import { formatDateTime } from "@/lib/control/format";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import "@/types/table-meta";

function isMerchantCode(v: string | null): v is MerchantCode {
  return v !== null && v in MERCHANT_LABEL;
}

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
    accessorKey: "psp",
    header: "PSP",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">
        {PROVIDER_LABEL[row.original.psp]}
      </span>
    ),
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
    cell: ({ row }) => {
      const code = row.original.merchantId;
      return (
        <span className="text-sm text-foreground">
          {isMerchantCode(code) ? MERCHANT_LABEL[code] : "—"}
        </span>
      );
    },
  },
  {
    id: "enabledMethods",
    header: "ช่องทางที่เปิดใช้",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.enabledMethods.join(", ")}
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
