"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import type { ApprovalRequest } from "@/types/control/approval";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import {
  ACTION_LABEL,
  STATUS_LABEL,
  statusTone,
  canApprove,
} from "@/lib/control/approval";
import { formatDateTime } from "@/lib/control/format";
import { formatTHB } from "@/lib/utils";
import { StatusSpine } from "@/components/control/shared/status-spine";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import "@/types/table-meta";

interface ApprovalColumnsConfig {
  actorId: string;
  /** Ids whose decision is committing — buttons spin + disable while present. */
  inFlight: Set<string>;
  onApprove: (req: ApprovalRequest) => void;
  onReject: (req: ApprovalRequest) => void;
}

/**
 * Columns factory for the maker-checker queue. Closes over the current actor and
 * the approve/reject handlers so the action cell can decide — per row — whether the
 * controls are enabled (canApprove) and which reason to surface when they are not.
 */
export function approvalColumns({
  actorId,
  inFlight,
  onApprove,
  onReject,
}: ApprovalColumnsConfig): ColumnDef<ApprovalRequest>[] {
  return [
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
      accessorKey: "actionType",
      header: "การดำเนินการ",
      enableSorting: true,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              {ACTION_LABEL[r.actionType]}
            </span>
            <span className="text-data text-xs text-grey-600">{r.target}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "maker",
      header: "ผู้ขอ",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-data text-xs text-grey-700">
          {row.original.maker}
        </span>
      ),
    },
    {
      accessorKey: "refAmount",
      header: "อ้างอิง — เงิน settle PSP→บริษัทโดยตรง",
      enableSorting: true,
      cell: ({ row }) => {
        const amount = row.original.refAmount;
        return (
          <span className="text-data text-sm text-foreground">
            {amount == null ? "—" : formatTHB(amount)}
          </span>
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
      accessorKey: "requestedAt",
      header: "ขอเมื่อ",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-data text-xs text-grey-600">
          {formatDateTime(row.original.requestedAt)}
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
      meta: { headClassName: "w-[180px]", ignoreRowClick: true },
      header: () => null,
      cell: ({ row }) => {
        const r = row.original;
        const busy = inFlight.has(r.id);
        const allowed = canApprove(r, actorId);
        const reason =
          r.maker === actorId
            ? "ไม่สามารถอนุมัติคำขอของตนเอง"
            : "คำขอนี้ดำเนินการแล้ว";

        const buttons = (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={!allowed || busy}
              onClick={() => onApprove(r)}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : "อนุมัติ"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!allowed || busy}
              onClick={() => onReject(r)}
            >
              ปฏิเสธ
            </Button>
          </div>
        );

        if (allowed) return buttons;

        return (
          <TooltipProvider>
            <Tooltip>
              {/* disabled buttons swallow pointer events — wrap so the tooltip still fires */}
              <TooltipTrigger render={<span className="inline-flex" />}>
                {buttons}
              </TooltipTrigger>
              <TooltipContent>{reason}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];
}
