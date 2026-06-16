"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Agent } from "@/types/originator";
import type { Branch } from "@/types/originator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/payment/status-badge";
import {
  Eye,
  EllipsisVertical,
  Pencil,
  ArrowRightLeft,
  History,
  CircleX,
  CircleCheck,
  Shield,
  User,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_GRADIENT: Record<Agent["type"], string> = {
  agent: "from-blue-400 to-blue-700",
  broker: "from-violet-500 to-violet-900",
  staff: "from-emerald-500 to-emerald-800",
};

const TYPE_LABEL: Record<Agent["type"], string> = {
  agent: "ตัวแทน",
  broker: "นายหน้า",
  staff: "พนักงานประจำสาขา",
};

const TYPE_ICON: Record<Agent["type"], React.ElementType> = {
  agent: User,
  broker: Briefcase,
  staff: Shield,
};

function fmtTHB(n: number): string {
  return new Intl.NumberFormat("th-TH", { minimumFractionDigits: 0 }).format(n);
}

interface BuildColumnsOptions {
  branchMap: Map<string, Branch>;
  onView: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onToggleActive: (agent: Agent) => void;
}

export function buildAgentColumns({
  branchMap,
  onView,
  onEdit,
  onToggleActive,
}: BuildColumnsOptions): ColumnDef<Agent>[] {
  return [
    {
      id: "nameCode",
      accessorKey: "name",
      header: "รหัส / ชื่อ",
      enableSorting: true,
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "grid size-[34px] shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
                AVATAR_GRADIENT[a.type],
              )}
            >
              {a.code}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="text-[12px] text-grey-500">
                {a.id} · เข้าร่วม {a.joined}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "type",
      accessorKey: "type",
      header: "ประเภท",
      enableSorting: true,
      cell: ({ row }) => {
        const a = row.original;
        const Icon = TYPE_ICON[a.type];
        return (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Icon className="size-[11px] shrink-0" />
            {TYPE_LABEL[a.type]}
          </span>
        );
      },
    },
    {
      id: "parent",
      accessorKey: "parent",
      header: "สังกัดสาขา",
      enableSorting: true,
      cell: ({ row }) => {
        const branch = branchMap.get(row.original.parent);
        if (!branch) return <span className="text-grey-400">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-blue-700 to-blue-600 text-[9px] font-bold text-white">
              {branch.code}
            </span>
            <span className="text-sm font-semibold">{branch.name}</span>
          </div>
        );
      },
    },
    {
      id: "license",
      accessorKey: "license",
      header: "เลขใบอนุญาต / รหัสพนักงาน",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.license}</span>
      ),
    },
    {
      id: "region",
      accessorKey: "region",
      header: "พื้นที่ดูแล",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-grey-500">{row.original.region}</span>
      ),
    },
    {
      id: "txnCount",
      accessorKey: "txnCount",
      header: "ธุรกรรม 30 วัน",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="tabular-nums">{fmtTHB(row.original.txnCount)}</span>
      ),
    },
    {
      id: "volume",
      accessorKey: "volume",
      header: "มูลค่ารวม",
      enableSorting: true,
      cell: ({ row }) => (
        <strong className="tabular-nums">฿{fmtTHB(row.original.volume)}</strong>
      ),
    },
    {
      id: "status",
      accessorKey: "active",
      header: "สถานะ",
      enableSorting: true,
      cell: ({ row }) => (
        <StatusBadge status={row.original.active ? "active" : "paused"} />
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      size: 80,
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-grey-500 hover:text-foreground"
              onClick={() => onView(a)}
              aria-label="ดูรายละเอียด"
            >
              <Eye className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-grey-500 hover:text-foreground"
                  />
                }
              >
                <EllipsisVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                <DropdownMenuItem onSelect={() => onEdit(a)}>
                  <Pencil className="size-4" />
                  แก้ไขข้อมูล
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onView(a)}>
                  <History className="size-4" />
                  ดูประวัติธุรกรรม
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowRightLeft className="size-4" />
                  โอนย้ายสาขา
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant={a.active ? "destructive" : "default"}
                  onSelect={() => onToggleActive(a)}
                >
                  {a.active ? (
                    <CircleX className="size-4" />
                  ) : (
                    <CircleCheck className="size-4" />
                  )}
                  {a.active ? "ระงับสิทธิ์การใช้งาน" : "เปิดใช้งาน"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
