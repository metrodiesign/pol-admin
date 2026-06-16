import { NOTIFICATIONS } from "@/lib/mock/notifications";
import { MessageSquare, Mail, AlertCircle, Clock } from "lucide-react";
import { StatCardIcon } from "@/components/payment/stat-card";

export function NotificationsKpiStrip() {
  const smsSent = NOTIFICATIONS.filter(
    (n) => n.type === "sms" && n.status === "sent",
  ).length;
  const emailSent = NOTIFICATIONS.filter(
    (n) => n.type === "email" && n.status === "sent",
  ).length;
  const failed = NOTIFICATIONS.filter((n) => n.status === "failed").length;
  const queued = NOTIFICATIONS.filter((n) => n.status === "queued").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCardIcon
        icon={MessageSquare}
        label="SMS ส่งสำเร็จ"
        value={smsSent.toLocaleString("th-TH")}
        sub="วันนี้"
        tone="success"
      />
      <StatCardIcon
        icon={Mail}
        label="อีเมลส่งสำเร็จ"
        value={emailSent.toLocaleString("th-TH")}
        sub="วันนี้"
        tone="primary"
      />
      <StatCardIcon
        icon={AlertCircle}
        label="ส่งไม่สำเร็จ"
        value={failed.toLocaleString("th-TH")}
        sub="ลองส่งซ้ำได้"
        tone="danger"
      />
      <StatCardIcon
        icon={Clock}
        label="รอส่ง"
        value={queued.toLocaleString("th-TH")}
        sub="อยู่ในคิว"
        tone="warning"
      />
    </div>
  );
}
