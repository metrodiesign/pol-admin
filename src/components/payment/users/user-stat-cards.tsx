import { Users, Shield, CheckCircle, XCircle } from "lucide-react";
import { StatCardIcon } from "@/components/payment/stat-card";

interface UserStatCardsProps {
  total: number;
  adminCount: number;
  merchantCount: number;
  pendingCount: number;
  activeCount: number;
  disabledCount: number;
}

export function UserStatCards({
  total,
  adminCount,
  merchantCount,
  pendingCount,
  activeCount,
  disabledCount,
}: UserStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCardIcon
        icon={Users}
        label="ผู้ใช้งานทั้งหมด"
        value={total}
        sub={`Admin ${adminCount} · Merchant ${merchantCount}`}
        tone="primary"
      />
      <StatCardIcon
        icon={Shield}
        label="รออนุมัติ"
        value={pendingCount}
        sub="บัญชีใหม่ที่ยังไม่ approve"
        tone="warning"
      />
      <StatCardIcon
        icon={CheckCircle}
        label="ใช้งานอยู่"
        value={activeCount}
        sub="รวมทุก portal"
        tone="success"
      />
      <StatCardIcon
        icon={XCircle}
        label="ปิดใช้งาน"
        value={disabledCount}
        sub="รวมที่ปิดใช้งานทั้งหมด"
        tone="neutral"
      />
    </div>
  );
}
