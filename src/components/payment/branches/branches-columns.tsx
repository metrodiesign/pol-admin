"use client";

import "@/types/table-meta";
import type { ColumnDef } from "@tanstack/react-table";
import type { Branch, Agent } from "@/types/originator";
import {
  Eye,
  MoreHorizontal,
  Settings,
  Copy,
  Users,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/payment/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BranchColumnHandlers {
  onViewBranch: (branch: Branch) => void;
  onEditBranch: (branch: Branch) => void;
  onDuplicateBranch: (branch: Branch) => void;
  onViewAgents: (branchId: string) => void;
  onToggleActive: (branch: Branch) => void;
  onDeleteBranch: (branch: Branch) => void;
}

export function makeBranchColumns(
  agents: Agent[],
  handlers: BranchColumnHandlers,
): ColumnDef<Branch>[] {
  return [
    {
      accessorKey: "name",
      enableSorting: true,
      sortingFn: (a, b) =>
        a.original.name.localeCompare(b.original.name, "th"),
      header: "สาขา",
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-blue-700 to-blue-600 text-white grid place-items-center text-xs font-bold tracking-tight shrink-0">
              {b.code}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-foreground">
                {b.name}
              </div>
              <div className="text-xs text-grey-500">
                {b.id} · {b.region}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "address",
      enableSorting: false,
      header: "ที่อยู่",
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="max-w-[220px]">
            <div className="text-sm text-grey-600 leading-snug line-clamp-2">
              {b.address}
            </div>
            <div className="text-xs text-grey-500 mt-0.5">
              เปิดให้บริการ {b.established}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "manager",
      enableSorting: true,
      sortingFn: (a, b) =>
        a.original.manager.localeCompare(b.original.manager, "th"),
      header: "ผู้จัดการ",
      cell: ({ row }) => (
        <div className="text-sm font-medium text-foreground">
          {row.original.manager}
        </div>
      ),
    },
    {
      id: "phone",
      enableSorting: false,
      header: "ติดต่อ",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-grey-600">
          {row.original.phone}
        </span>
      ),
    },
    {
      id: "members",
      enableSorting: false,
      header: "ผู้สังกัด",
      meta: { headClassName: "text-right" },
      cell: ({ row }) => {
        const b = row.original;
        const members = agents.filter((a) => a.parent === b.id);
        const staffN = members.filter((m) => m.type === "staff").length;
        const agentN = members.filter((m) => m.type === "agent").length;
        const brokerN = members.filter((m) => m.type === "broker").length;
        return (
          <div className="text-right">
            <span onClick={(e) => e.stopPropagation()}>
              <button
                className={cn(
                  "inline-flex items-center gap-0.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors",
                )}
                onClick={() => handlers.onViewAgents(b.id)}
              >
                {members.length} คน
                <ChevronRight size={11} />
              </button>
            </span>
            <div className="text-xs text-grey-500 text-right mt-0.5">
              {staffN} พนง. · {agentN} ตัวแทน · {brokerN} นายหน้า
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "txnCount",
      enableSorting: true,
      header: "ธุรกรรม 30 วัน",
      meta: { headClassName: "text-right" },
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-mono text-sm tabular-nums text-foreground">
            {row.original.txnCount.toLocaleString("th-TH")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "volume",
      enableSorting: true,
      header: "มูลค่ารวม",
      meta: { headClassName: "text-right" },
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-mono text-sm font-bold tabular-nums text-foreground">
            ฿{row.original.volume.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      enableSorting: false,
      header: "สถานะ",
      cell: ({ row }) => (
        <StatusBadge status={row.original.active ? "active" : "paused"} />
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { headClassName: "w-20", cellClassName: "w-20" },
      header: () => null,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <span onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                title="ดูรายละเอียด"
                onClick={() => handlers.onViewBranch(b)}
              >
                <Eye size={13} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="ตัวเลือกเพิ่มเติม"
                    />
                  }
                >
                  <MoreHorizontal size={13} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handlers.onEditBranch(b)}>
                    <Settings size={13} />
                    แก้ไขสาขา
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlers.onDuplicateBranch(b)}
                  >
                    <Copy size={13} />
                    ทำสำเนา
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlers.onViewAgents(b.id)}
                  >
                    <Users size={13} />
                    ดูบุคลากร
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant={b.active ? "destructive" : "default"}
                    onClick={() => handlers.onToggleActive(b)}
                  >
                    {b.active ? "พักใช้งานสาขา" : "เปิดใช้งานสาขา"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handlers.onDeleteBranch(b)}
                  >
                    <Trash2 size={13} />
                    ลบสาขา
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </span>
        );
      },
    },
  ];
}
