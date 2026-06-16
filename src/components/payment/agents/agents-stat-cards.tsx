import {
  User,
  Briefcase,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { StatCardIcon } from "@/components/payment/stat-card";

interface AgentsStatCardsProps {
  staffCount: number;
  agentCount: number;
  brokerCount: number;
  activeCount: number;
  pausedCount: number;
}

export function AgentsStatCards({
  staffCount,
  agentCount,
  brokerCount,
  activeCount,
  pausedCount,
}: AgentsStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCardIcon
        icon={ShieldCheck}
        label="พนักงานประจำสาขา"
        value={`${staffCount} คน`}
        sub="ลูกจ้างประจำ / Front office"
        tone="primary"
      />
      <StatCardIcon
        icon={User}
        label="ตัวแทนประกันภัย"
        value={`${agentCount} คน`}
        sub="มีใบอนุญาตประกันชีวิต/วินาศภัย"
        tone="primary"
      />
      <StatCardIcon
        icon={Briefcase}
        label="นายหน้าประกันภัย"
        value={`${brokerCount} ราย`}
        sub="นิติบุคคล/บริษัท"
        tone="primary"
      />
      <StatCardIcon
        icon={CheckCircle}
        label="พร้อมใช้งาน"
        value={`${activeCount} คน`}
        sub="สร้างลิงก์ชำระให้ลูกค้าได้"
        tone="success"
      />
      <StatCardIcon
        icon={AlertTriangle}
        label="พักใช้งาน"
        value={`${pausedCount} คน`}
        sub="ระงับสิทธิ์การใช้งานชั่วคราว"
        tone="warning"
      />
    </div>
  );
}
