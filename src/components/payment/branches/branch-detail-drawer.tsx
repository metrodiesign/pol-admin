"use client";

import { Settings, MoreHorizontal, Plus, UserCog, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityDrawer } from "@/components/payment/entity-drawer";
import { StatusBadge } from "@/components/payment/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Branch, Agent } from "@/types/originator";

interface BranchDetailDrawerProps {
  branch: Branch | null;
  agents: Agent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (branch: Branch) => void;
  onAddMember: (branch: Branch) => void;
  onToggleActive: (branch: Branch) => void;
}

function fmtTHB(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function fmtInt(n: number): string {
  return n.toLocaleString("th-TH");
}

export function BranchDetailDrawer({
  branch,
  agents,
  open,
  onOpenChange,
  onEdit,
  onAddMember,
  onToggleActive,
}: BranchDetailDrawerProps) {
  if (!branch) return null;

  const members = agents.filter((a) => a.parent === branch.id);
  const staffN = members.filter((m) => m.type === "staff").length;
  const agentsN = members.filter((m) => m.type === "agent").length;
  const brokersN = members.filter((m) => m.type === "broker").length;
  const avgPerTxn =
    branch.txnCount > 0 ? Math.round(branch.volume / branch.txnCount) : 0;

  return (
    <EntityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={branch.id}
      description="รายละเอียดสาขา"
      width="sm:max-w-[620px]"
    >
      {/* Header actions row */}
      <div className="flex items-center gap-2 mb-5 -mt-1">
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(branch)}
          title="แก้ไข"
        >
          <Settings size={16} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UserCog size={13} />
              กำหนดผู้จัดการใหม่
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download size={13} />
              ส่งออกข้อมูลสาขา
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant={branch.active ? "destructive" : "default"}
              onClick={() => onToggleActive(branch)}
            >
              {branch.active ? "พักใช้งานสาขา" : "เปิดใช้งานสาขา"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hero */}
      <div className="flex items-start gap-3.5 mb-5">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-700 to-blue-600 text-white grid place-items-center text-lg font-bold shrink-0">
          {branch.code}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-foreground">{branch.name}</div>
          <div className="text-sm text-grey-500 mt-0.5">
            {branch.region} · เปิดให้บริการตั้งแต่ปี {branch.established}
          </div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <StatusBadge status={branch.active ? "active" : "paused"} />
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-grey-600">
              {members.length} บุคลากร
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-muted border border-border rounded-lg p-3">
          <div className="text-xs text-grey-500">ธุรกรรม 30 วัน</div>
          <div className="text-xl font-bold mt-0.5 tabular-nums text-foreground">
            {fmtInt(branch.txnCount)}
          </div>
        </div>
        <div className="bg-muted border border-border rounded-lg p-3">
          <div className="text-xs text-grey-500">มูลค่ารวม</div>
          <div className="text-xl font-bold mt-0.5 tabular-nums text-foreground">
            ฿{(branch.volume / 1e6).toFixed(2)}M
          </div>
        </div>
        <div className="bg-muted border border-border rounded-lg p-3">
          <div className="text-xs text-grey-500">เฉลี่ย/รายการ</div>
          <div className="text-xl font-bold mt-0.5 tabular-nums text-foreground">
            ฿{fmtTHB(avgPerTxn)}
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-grey-500 uppercase tracking-wider mb-2">
          ข้อมูลสาขา
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          {[
            { label: "รหัสสาขา", value: branch.code, mono: true },
            { label: "ที่อยู่", value: branch.address, mono: false },
            { label: "ผู้จัดการสาขา", value: branch.manager, mono: false },
            {
              label: "หมายเลขโทรศัพท์",
              value: branch.phone,
              mono: true,
            },
            { label: "ภูมิภาค", value: branch.region, mono: false },
            {
              label: "ปีที่ก่อตั้ง",
              value: branch.established,
              mono: false,
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={cn(
                "flex items-start gap-3 px-3.5 py-2.5",
                i < arr.length - 1 && "border-b border-border",
              )}
            >
              <div className="w-32 shrink-0 text-sm text-grey-500 pt-px">
                {row.label}
              </div>
              <div
                className={cn(
                  "flex-1 text-sm font-medium text-foreground break-words",
                  row.mono && "font-mono",
                )}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center mb-2">
          <div className="text-xs font-semibold text-grey-500 uppercase tracking-wider">
            บุคลากรในสาขา ({members.length})
          </div>
          <span className="text-xs text-grey-500 ml-2">
            · {staffN} พนง. · {agentsN} ตัวแทน · {brokersN} นายหน้า
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => onAddMember(branch)}
          >
            <Plus size={12} />
            เพิ่ม
          </Button>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          {members.length === 0 ? (
            <div className="p-4 text-center text-sm text-grey-500">
              ยังไม่มีบุคลากรในสาขานี้
            </div>
          ) : (
            members.map((m, i) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5",
                  i < members.length - 1 && "border-b border-border",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full text-white grid place-items-center text-xs font-bold shrink-0",
                    m.type === "agent"
                      ? "bg-gradient-to-br from-blue-400 to-blue-700"
                      : m.type === "broker"
                        ? "bg-gradient-to-br from-violet-500 to-violet-900"
                        : "bg-gradient-to-br from-emerald-500 to-emerald-800",
                  )}
                >
                  {m.code}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate text-foreground">
                    {m.name}
                  </div>
                  <div className="text-xs text-grey-500">
                    {m.type === "agent"
                      ? "ตัวแทน"
                      : m.type === "broker"
                        ? "นายหน้า"
                        : "พนักงาน"}{" "}
                    · {fmtInt(m.txnCount)} ธุรกรรม
                  </div>
                </div>
                <StatusBadge status={m.active ? "active" : "paused"} />
              </div>
            ))
          )}
        </div>
      </div>
    </EntityDrawer>
  );
}
