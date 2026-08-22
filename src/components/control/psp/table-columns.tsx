"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, CircleAlert, Clock3, Eye, Hourglass, Power } from "lucide-react";

import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import type { ApprovalState, PspConnectionListRow } from "@/types/control/psp-connection";
import "@/types/table-meta";

function ApprovalIcon({ state }: { state: ApprovalState }) {
  if (state === "pending") return <Hourglass className="size-3.5" />;
  if (state === "unavailable") return <CircleAlert className="size-3.5" />;
  return <Clock3 className="size-3.5" />;
}

export const pspColumns: ColumnDef<PspConnectionListRow>[] = [
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
    id: "identity",
    header: "Connection",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="max-w-44">
        <p className="text-data truncate text-xs font-semibold text-foreground">
          {row.original.pspConnectionId}
        </p>
        <p className="mt-0.5 truncate text-xs text-grey-500">{row.original.merchantName}</p>
      </div>
    ),
  },
  {
    accessorKey: "psp",
    header: "PSP",
    enableSorting: false,
    cell: ({ row }) => <span className="font-semibold">{PROVIDER_LABEL[row.original.psp]}</span>,
  },
  {
    id: "methods",
    header: "ช่องทาง",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-grey-700">
        {row.original.enabledMethods.map((method) => METHOD_LABEL[method]).join(", ") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "isEnabled",
    header: "Enabled",
    enableSorting: false,
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
    cell: ({ row }) => (
      <div>
        <p className="text-xs font-semibold text-grey-700">{lastTestLabel(row.original.lastTestResult)}</p>
        <p className="text-data mt-0.5 text-xs text-grey-500">
          {formatDateTime(row.original.lastTestedAt ?? "")}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "approvalState",
    header: "Approval",
    enableSorting: false,
    cell: ({ row }) => (
      <ControlStatusBadge
        tone={approvalTone(row.original.approvalState)}
        label={APPROVAL_LABEL[row.original.approvalState]}
        icon={<ApprovalIcon state={row.original.approvalState} />}
      />
    ),
  },
  {
    id: "view",
    header: "",
    enableSorting: false,
    meta: { headClassName: "w-24", cellClassName: "w-24", ignoreRowClick: true },
    cell: ({ row }) => (
      <Link
        href={`/control/psp/read?id=${encodeURIComponent(row.original.pspConnectionId)}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
      >
        <Eye className="size-3.5" />
        ดูข้อมูล
      </Link>
    ),
  },
];
