"use client";

import type { ColumnDef } from "@tanstack/react-table";
import "@/types/table-meta";
import type { Policy, VcpStatus } from "@/types/policy";
import { formatAmount, formatThaiSlashDate, cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PolicyRowActions } from "./policy-row-actions";

const INSURANCE_KIND_LABEL: Record<Policy["insuranceKind"], string> = {
  VMI: "ภาคสมัครใจ (VMI)",
  CMI: "ภาคบังคับ (CMI)",
};

const REFERENCE_TYPE_LABEL: Record<Policy["referenceType"], string> = {
  policy: "เลขกรมธรรม์",
  claim: "เลขรับแจ้ง",
};

/** badge สถานะการชำระเงิน (VCP) — สี + ข้อความ (none = เว้นว่างตามแบบ). */
const VCP_META: Record<Exclude<VcpStatus, "none">, { chip: string; label: string }> = {
  awaiting: { chip: "bg-warning/16 text-warning-dark", label: "รอชำระเงิน" },
  paid: { chip: "bg-success/16 text-success-dark", label: "ชำระสำเร็จ" },
};

/** ลำดับ sort สถานะ: ว่าง (—) ก่อน → รอชำระเงิน → ชำระสำเร็จ. */
const VCP_SORT_RANK: Record<VcpStatus, number> = {
  none: 0,
  awaiting: 1,
  paid: 2,
};

function VcpBadge({ vcp }: { vcp: VcpStatus }) {
  if (vcp === "none") return <span className="text-grey-400">—</span>;
  const style = VCP_META[vcp];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold whitespace-nowrap",
        style.chip,
      )}
    >
      {style.label}
    </span>
  );
}

export const policyColumns: ColumnDef<Policy>[] = [
  {
    id: "actions",
    header: () => null,
    enableSorting: false,
    meta: { headClassName: "w-32", cellClassName: "w-32", ignoreRowClick: true },
    cell: ({ row, table }) => (
      <PolicyRowActions policy={row.original} cart={table.options.meta?.cart} />
    ),
  },
  {
    id: "insuranceKind",
    header: "ประเภทประกันภัย",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap text-foreground">
        {INSURANCE_KIND_LABEL[row.original.insuranceKind]}
      </span>
    ),
  },
  {
    id: "referenceNo",
    header: "หมายเลขกรมธรรม์ / รับแจ้ง",
    enableSorting: true,
    accessorFn: (p) => p.referenceNo,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="min-w-0 whitespace-nowrap">
          <span className="block text-sm font-medium text-primary underline underline-offset-2">
            {p.referenceNo}
          </span>
          <span className="block text-xs text-grey-500">
            {REFERENCE_TYPE_LABEL[p.referenceType]}
          </span>
        </div>
      );
    },
  },
  {
    id: "customer",
    header: "ชื่อ-นามสกุล",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block min-w-0 truncate text-sm text-foreground">
        {row.original.customer.name}
      </span>
    ),
  },
  {
    id: "extraInfo",
    header: "ข้อมูลเพิ่มเติม",
    enableSorting: false,
    cell: ({ row }) => {
      const info = row.original.extraInfo;
      if (!info.tooltip) {
        return <span className="text-sm whitespace-nowrap text-foreground">{info.text}</span>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="cursor-help text-sm whitespace-nowrap text-foreground underline decoration-dotted underline-offset-4" />
              }
            >
              {info.text}
            </TooltipTrigger>
            <TooltipContent>{info.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "netPremium",
    header: "เบี้ยสุทธิ",
    enableSorting: true,
    accessorFn: (p) => p.netPremium,
    meta: { headClassName: "text-right", cellClassName: "text-right" },
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap text-foreground">
        {formatAmount(row.original.netPremium, 2)}
      </span>
    ),
  },
  {
    id: "totalAmount",
    header: "เบี้ยรวม",
    enableSorting: true,
    accessorFn: (p) => p.totalAmount,
    meta: { headClassName: "text-right", cellClassName: "text-right" },
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap text-foreground">
        {formatAmount(row.original.totalAmount, 2)}
      </span>
    ),
  },
  {
    id: "deduction",
    header: "ตัดชำระเบี้ย",
    enableSorting: false,
    cell: ({ row }) => {
      const d = row.original.deduction;
      if (d.state === "none") {
        return <span className="text-sm text-grey-500">N/A</span>;
      }
      return (
        <div className="min-w-0 whitespace-nowrap">
          <span className="block text-sm text-foreground">ตัดชำระแล้ว</span>
          {d.date ? (
            <span className="block text-xs text-grey-500">{formatThaiSlashDate(d.date)}</span>
          ) : null}
        </div>
      );
    },
  },
  {
    id: "vcp",
    header: "สถานะ",
    enableSorting: true,
    accessorFn: (p) => VCP_SORT_RANK[p.vcp],
    cell: ({ row }) => <VcpBadge vcp={row.original.vcp} />,
  },
];
