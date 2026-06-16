"use client";

import {
  Building2,
  Users,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { Branch, Agent } from "@/types/originator";
import { StatCardIcon } from "@/components/payment/stat-card";

interface BranchStatCardsProps {
  branches: Branch[];
  agents: Agent[];
}

export function BranchStatCards({ branches, agents }: BranchStatCardsProps) {
  const totalPersonnel = agents.length;
  const staffCount = agents.filter((a) => a.type === "staff").length;
  const agentCount = agents.filter((a) => a.type === "agent").length;
  const brokerCount = agents.filter((a) => a.type === "broker").length;
  const activeCount = branches.filter((b) => b.active).length;
  const pausedCount = branches.filter((b) => !b.active).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCardIcon
        icon={Building2}
        label="จำนวนสาขา"
        value={`${branches.length} สาขา`}
        sub={`ครอบคลุม ${new Set(branches.map((b) => b.region)).size} ภูมิภาค`}
        tone="primary"
      />
      <StatCardIcon
        icon={Users}
        label="พนักงานสังกัดรวม"
        value={`${totalPersonnel} คน`}
        sub={`พนง.ประจำ ${staffCount} · ตัวแทน ${agentCount} · นายหน้า ${brokerCount}`}
        tone="primary"
      />
      <StatCardIcon
        icon={CheckCircle}
        label="พร้อมใช้งาน"
        value={`${activeCount} สาขา`}
        sub="รับชำระเงินได้ตามปกติ"
        tone="success"
      />
      <StatCardIcon
        icon={AlertTriangle}
        label="พักใช้งาน"
        value={`${pausedCount} สาขา`}
        sub="ไม่สามารถสร้างลิงก์ชำระได้"
        tone="warning"
      />
    </div>
  );
}
