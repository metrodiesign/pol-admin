"use client";

import { EntityDrawer } from "@/components/payment/entity-drawer";
import { StatusBadge } from "@/components/payment/status-badge";
import type { Agent, Branch } from "@/types/originator";
import type { Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";
import {
  Shield,
  User,
  Briefcase,
  Pencil,
  GitBranch,
  Download,
  CircleX,
  CircleCheck,
  History,
  EllipsisVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const AVATAR_GRADIENT: Record<Agent["type"], string> = {
  agent: "from-blue-400 to-blue-700",
  broker: "from-violet-500 to-violet-900",
  staff: "from-emerald-500 to-emerald-800",
};

const TYPE_LABEL: Record<Agent["type"], string> = {
  agent: "ตัวแทนประกันภัย",
  broker: "นายหน้าประกันภัย",
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

function InfoRow({
  label,
  value,
  mono = false,
  last = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5",
        !last && "border-b border-[rgba(145,158,171,0.12)]",
      )}
    >
      <div className="w-[130px] shrink-0 text-sm text-grey-500">{label}</div>
      <div className={cn("flex-1 text-sm font-semibold", mono && "font-mono")}>
        {value}
      </div>
    </div>
  );
}

interface AgentDetailDrawerProps {
  agent: Agent | null;
  branch: Branch | undefined;
  recentTxns: Transaction[];
  onClose: () => void;
  onEdit: (agent: Agent) => void;
  onToggleActive: (agent: Agent) => void;
}

export function AgentDetailDrawer({
  agent,
  branch,
  recentTxns,
  onClose,
  onEdit,
  onToggleActive,
}: AgentDetailDrawerProps) {
  if (!agent) return null;

  const TypeIcon = TYPE_ICON[agent.type];
  const typeLabel = TYPE_LABEL[agent.type];
  const commission = Math.round(agent.volume * 0.012);

  return (
    <EntityDrawer
      open={!!agent}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={agent.id}
      description={typeLabel}
      width="sm:max-w-[580px]"
    >
      {/* Header actions */}
      <div className="mb-5 flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(agent)}
          aria-label="แก้ไข"
        >
          <Pencil className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="ตัวเลือกเพิ่มเติม"
              />
            }
          >
            <EllipsisVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem>
              <GitBranch className="size-4" />
              โอนย้ายสาขา
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="size-4" />
              ส่งออกประวัติ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant={agent.active ? "destructive" : "default"}
              onSelect={() => onToggleActive(agent)}
            >
              {agent.active ? (
                <CircleX className="size-4" />
              ) : (
                <CircleCheck className="size-4" />
              )}
              {agent.active ? "ระงับสิทธิ์การใช้งาน" : "เปิดใช้งานอีกครั้ง"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hero */}
      <div className="mb-5 flex items-start gap-3.5">
        <div
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br text-base font-bold text-white",
            AVATAR_GRADIENT[agent.type],
          )}
        >
          {agent.code}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold">{agent.name}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-grey-500">
            <TypeIcon className="size-3.5 shrink-0" />
            {typeLabel} · เข้าร่วม {agent.joined}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <StatusBadge status={agent.active ? "active" : "paused"} />
            {branch && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-grey-500/10 px-2 py-0.5 text-xs font-semibold text-grey-600">
                <GitBranch className="size-3" />
                {branch.code} · {branch.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "ธุรกรรม 30 วัน", value: fmtTHB(agent.txnCount) },
          { label: "มูลค่ารวม", value: `฿${(agent.volume / 1e6).toFixed(2)}M` },
          {
            label: "ค่าคอมมิชชั่น (โดยประมาณ)",
            value: `฿${fmtTHB(commission)}`,
            highlight: true,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[rgba(145,158,171,0.12)] bg-grey-100/50 p-3 dark:bg-grey-800/20"
          >
            <div className="text-sm text-grey-500">{s.label}</div>
            <div
              className={cn(
                "mt-0.5 text-xl font-bold tabular-nums",
                s.highlight && "text-success-dark",
              )}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mb-5">
        <div className="mb-2 text-sm font-semibold uppercase tracking-[0.06em] text-grey-400">
          ข้อมูลบุคลากร
        </div>
        <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.12)]">
          <InfoRow label="รหัส" value={agent.id} mono />
          <InfoRow label="รหัสภายใน" value={agent.code} mono />
          <InfoRow
            label={agent.type === "staff" ? "รหัสพนักงาน" : "เลขใบอนุญาต"}
            value={agent.license}
            mono
          />
          <InfoRow label="พื้นที่ดูแล" value={agent.region} />
          <InfoRow
            label="สังกัดสาขา"
            value={branch ? `[${branch.code}] ${branch.name}` : "—"}
          />
          <InfoRow label="วันที่เข้าร่วม" value={`ปี ${agent.joined}`} last />
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="mb-2 flex items-center">
          <div className="text-sm font-semibold uppercase tracking-[0.06em] text-grey-400">
            ธุรกรรมล่าสุดที่สร้าง
          </div>
          <Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-sm">
            <History className="size-3.5" />
            ทั้งหมด
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-[rgba(145,158,171,0.12)]">
          {recentTxns.length === 0 ? (
            <div className="p-4 text-center text-sm text-grey-500">
              ยังไม่มีธุรกรรม
            </div>
          ) : (
            recentTxns.map((t, i) => (
              <div
                key={t.id}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5",
                  i < recentTxns.length - 1 &&
                    "border-b border-[rgba(145,158,171,0.12)]",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-sm font-semibold">
                    {t.id}
                  </div>
                  <div className="truncate text-sm text-grey-500">
                    {t.customer.name}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold tabular-nums">
                    ฿{fmtTHB(t.amount)}
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </EntityDrawer>
  );
}
