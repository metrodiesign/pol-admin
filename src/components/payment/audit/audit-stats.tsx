import { History, User, Shield, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuditStatsProps {
  today: number;
  loginCount: number;
  sensitiveCount: number;
  activeActors: number;
}

type ToneKey = "primary" | "info" | "warning" | "success";

interface ToneConfig {
  bg: string;
  text: string;
}

const TONE: Record<ToneKey, ToneConfig> = {
  primary: { bg: "bg-primary/10",       text: "text-primary" },
  info:    { bg: "bg-info/10",           text: "text-info-dark" },
  warning: { bg: "bg-warning/12",        text: "text-warning-dark" },
  success: { bg: "bg-success/12",        text: "text-success-dark" },
};

interface StatItem {
  icon: React.ElementType;
  label: string;
  value: number;
  sub: string;
  tone: ToneKey;
}

export function AuditStats({ today, loginCount, sensitiveCount, activeActors }: AuditStatsProps) {
  const stats: StatItem[] = [
    {
      icon: History,
      label: "กิจกรรมวันนี้",
      value: today,
      sub: "ภายในช่วง 24 ชั่วโมง",
      tone: "primary",
    },
    {
      icon: User,
      label: "การเข้าสู่ระบบ",
      value: loginCount,
      sub: "รวมทุก IdP · จากทุก IP",
      tone: "info",
    },
    {
      icon: Shield,
      label: "กิจกรรมที่ต้องตรวจสอบ",
      value: sensitiveCount,
      sub: "delete, refund, void, approve",
      tone: "warning",
    },
    {
      icon: Users,
      label: "ผู้กระทำที่ active",
      value: activeActors,
      sub: "ผู้ใช้ที่มีกิจกรรมในช่วงนี้",
      tone: "success",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => {
        const tone = TONE[s.tone];
        const Icon = s.icon;
        return (
          <Card key={s.label} className="gap-0 py-0">
            <div className="flex items-center gap-3 px-5 py-4">
              <div
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl",
                  tone.bg,
                  tone.text,
                )}
              >
                <Icon className="size-[22px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-grey-500">{s.label}</p>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-grey-500">{s.sub}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
