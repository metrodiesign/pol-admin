"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import type { RoutingRule } from "@/types/control/routing-rule";
import { MERCHANT_LABEL } from "@/lib/mock/merchant";
import { CHANNEL_LABEL, PSP_LABEL, enabledTone } from "@/lib/control/routing";
import { formatTHB } from "@/lib/utils";
import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { Switch } from "@/components/ui/switch";
import "@/types/table-meta";

/** Human-readable amount band: "฿5,000–฿49,999", "ตั้งแต่ ฿50,000", or "ทุกจำนวน". */
function amountRange(rule: RoutingRule): string {
  const { minAmount, maxAmount } = rule;
  if (minAmount == null && maxAmount == null) return "ทุกจำนวน";
  if (minAmount != null && maxAmount != null)
    return `${formatTHB(minAmount)}–${formatTHB(maxAmount)}`;
  if (minAmount != null) return `ตั้งแต่ ${formatTHB(minAmount)}`;
  return `ไม่เกิน ${formatTHB(maxAmount!)}`;
}

export function routingColumns({
  onMoveUp,
  onMoveDown,
  onToggle,
}: {
  onMoveUp: (rule: RoutingRule) => void;
  onMoveDown: (rule: RoutingRule) => void;
  onToggle: (rule: RoutingRule) => void;
}): ColumnDef<RoutingRule>[] {
  return [
    {
      accessorKey: "priority",
      header: "ลำดับ",
      enableSorting: false,
      meta: { headClassName: "w-16", cellClassName: "w-16" },
      cell: ({ row }) => (
        <span className="text-data text-sm font-semibold text-grey-700">
          #{row.original.priority}
        </span>
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
      id: "channel",
      header: "ช่องทาง",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">
          {CHANNEL_LABEL[row.original.channel]}
        </span>
      ),
    },
    {
      id: "amount",
      header: "ช่วงจำนวนเงิน",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-data text-xs text-grey-700">
          {amountRange(row.original)}
        </span>
      ),
    },
    {
      id: "target",
      header: "PSP ปลายทาง",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {PSP_LABEL[row.original.targetPsp]}
        </span>
      ),
    },
    {
      id: "fallback",
      header: "PSP สำรอง",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.fallbackPsp ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-grey-600">
            <ArrowRight className="size-3.5 text-grey-500" />
            {PSP_LABEL[row.original.fallbackPsp]}
          </span>
        ) : (
          <span className="text-xs text-grey-500">—</span>
        ),
    },
    {
      id: "enabled",
      header: "สถานะ",
      enableSorting: false,
      meta: { ignoreRowClick: true },
      cell: ({ row }) => {
        const rule = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <Switch
              size="sm"
              checked={rule.enabled}
              onCheckedChange={() => onToggle(rule)}
            />
            <ControlStatusBadge
              tone={enabledTone(rule.enabled)}
              label={rule.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            />
          </div>
        );
      },
    },
    {
      id: "reorder",
      header: () => null,
      enableSorting: false,
      meta: { headClassName: "w-20", cellClassName: "w-20", ignoreRowClick: true },
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="เลื่อนลำดับขึ้น"
            onClick={() => onMoveUp(row.original)}
            className="inline-flex size-7 items-center justify-center rounded-lg text-grey-600 transition-colors hover:bg-[var(--action-hover)] hover:text-foreground"
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            aria-label="เลื่อนลำดับลง"
            onClick={() => onMoveDown(row.original)}
            className="inline-flex size-7 items-center justify-center rounded-lg text-grey-600 transition-colors hover:bg-[var(--action-hover)] hover:text-foreground"
          >
            <ArrowDown className="size-4" />
          </button>
        </div>
      ),
    },
  ];
}
