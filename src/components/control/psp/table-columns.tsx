"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, CircleAlert, Clock3, Eye, Hourglass, Power } from "lucide-react";

import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/control/format";
import {
  APPROVAL_LABEL,
  HEALTH_LABEL,
  METHOD_LABEL,
  PROVIDER_LABEL,
  approvalTone,
  enabledLabel,
  enabledTone,
  healthTone,
  lastTestLabel,
} from "@/lib/control/psp";
import type { ApprovalState, PspConnectionListRow } from "@/types/control/psp-connection";
import "@/types/table-meta";

function ApprovalIcon({ state }: { state: ApprovalState }) {
  if (state === "pending") return <Hourglass className="size-3.5" />;
  if (state === "unavailable") return <CircleAlert className="size-3.5" />;
  return <Clock3 className="size-3.5" />;
}

export const pspColumns: ColumnDef<PspConnectionListRow>[] = [
  {
    id: "identity",
    header: "Connection",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-[22px] text-foreground">
          {row.original.merchantName}
        </span>
        <span className="text-data block truncate text-sm leading-[22px] text-grey-500">
          {row.original.pspConnectionId}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "psp",
    header: "PSP",
    enableSorting: false,
    meta: { headClassName: "w-[120px]", cellClassName: "w-[120px]" },
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-foreground">{PROVIDER_LABEL[row.original.psp]}</span>
    ),
  },
  {
    id: "methods",
    header: "ช่องทาง",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.enabledMethods.map((method) => METHOD_LABEL[method]).join(", ") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "isEnabled",
    header: "Enabled",
    enableSorting: false,
    meta: { headClassName: "w-[120px]", cellClassName: "w-[120px]" },
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={enabledTone(row.original.isEnabled)}
        label={enabledLabel(row.original.isEnabled)}
        icon={<Power className="size-3.5" />}
      />
    ),
  },
  {
    accessorKey: "health",
    header: "Health",
    enableSorting: false,
    meta: { headClassName: "w-[120px]", cellClassName: "w-[120px]" },
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={healthTone(row.original.health)}
        label={HEALTH_LABEL[row.original.health]}
        icon={<Activity className="size-3.5" />}
      />
    ),
  },
  {
    id: "lastTest",
    header: "ทดสอบล่าสุด",
    enableSorting: false,
    meta: { headClassName: "w-[180px]", cellClassName: "w-[180px]" },
    cell: ({ row }) => (
      <div>
        <span className="block text-sm text-foreground">{lastTestLabel(row.original.lastTestResult)}</span>
        <span className="text-data block text-sm text-grey-500">
          {formatDateTime(row.original.lastTestedAt ?? "")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "approvalState",
    header: "Approval",
    enableSorting: false,
    meta: { headClassName: "w-[140px]", cellClassName: "w-[140px]" },
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={approvalTone(row.original.approvalState)}
        label={APPROVAL_LABEL[row.original.approvalState]}
        icon={<ApprovalIcon state={row.original.approvalState} />}
      />
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    meta: { headClassName: "w-20", cellClassName: "w-20", ignoreRowClick: true },
    header: () => null,
    cell: ({ row }) => (
      <TooltipProvider>
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                render={
                  <Link
                    href={`/control/psp/read?id=${encodeURIComponent(row.original.pspConnectionId)}`}
                  />
                }
                nativeButton={false}
                variant="ghost"
                size="icon-lg"
                className="size-10 cursor-pointer bg-grey-600/8 text-grey-700 hover:bg-grey-800 hover:text-white focus-visible:bg-grey-800 focus-visible:text-white"
                aria-label={`ดูรายละเอียด ${row.original.pspConnectionId}`}
              >
                <Eye className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ดูรายละเอียด</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    ),
  },
];
