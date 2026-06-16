"use client";

import { Shield, CheckCircle, Users, AlertTriangle } from "lucide-react";
import type { Role } from "@/types/role";
import { PERMISSIONS } from "@/lib/mock/roles";
import { StatCardIcon } from "@/components/payment/stat-card";

interface RolesSummaryCardsProps {
  roles: Role[];
  rolePerms: Record<string, string[]>;
  usageByRole: Record<string, number>;
}

export function RolesSummaryCards({
  roles,
  usageByRole,
}: RolesSummaryCardsProps) {
  const totalUsers = Object.values(usageByRole).reduce((a, b) => a + b, 0);
  const unusedRoles = roles.filter((r) => !usageByRole[r.id]).length;
  const adminCount = roles.filter((r) => r.portal === "admin").length;
  const merchantCount = roles.filter((r) => r.portal === "merchant").length;
  const permGroups = [...new Set(PERMISSIONS.map((p) => p.group))].length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCardIcon
        icon={Shield}
        label="Roles ทั้งหมด"
        value={roles.length}
        sub={`Admin ${adminCount} · Merchant ${merchantCount}`}
        tone="primary"
      />
      <StatCardIcon
        icon={CheckCircle}
        label="Permissions"
        value={PERMISSIONS.length}
        sub={`${permGroups} กลุ่ม`}
        tone="primary"
      />
      <StatCardIcon
        icon={Users}
        label="ผู้ใช้ที่ผูก Role"
        value={totalUsers}
        sub="รวมทุก portal"
        tone="success"
      />
      <StatCardIcon
        icon={AlertTriangle}
        label="Role ที่ยังไม่ถูกใช้"
        value={unusedRoles}
        sub="อาจพิจารณาลบหรือใช้งาน"
        tone="warning"
      />
    </div>
  );
}
