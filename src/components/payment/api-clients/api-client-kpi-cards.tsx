import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Briefcase, Zap, Shield, AlertTriangle } from "lucide-react";
import type { ApiClient } from "@/types/api-client";

interface ApiClientKpiCardsProps {
  clients: ApiClient[];
}

interface KpiDef {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  tone: "success" | "primary" | "info" | "warning";
}

const TONE_CLASS: Record<KpiDef["tone"], { bg: string; text: string }> = {
  success: { bg: "bg-success/10", text: "text-success-dark" },
  primary: { bg: "bg-primary/10", text: "text-primary" },
  info:    { bg: "bg-info/10",    text: "text-info-dark" },
  warning: { bg: "bg-warning/10", text: "text-warning-dark" },
};

export function ApiClientKpiCards({ clients }: ApiClientKpiCardsProps) {
  const activeCount = clients.filter((c) => c.status === "active").length;
  const totalReqs = clients.reduce((sum, c) => sum + c.reqs24h, 0);
  const inactiveCount = clients.filter((c) => c.status !== "active").length;

  const items: KpiDef[] = [
    {
      icon: <Briefcase size={22} />,
      label: "Active Clients",
      value: activeCount,
      sub: "รวม Apps + Services",
      tone: "success",
    },
    {
      icon: <Zap size={22} />,
      label: "Requests / 24h",
      value: totalReqs.toLocaleString("en-US"),
      sub: "รวมทุก client",
      tone: "primary",
    },
    {
      icon: <Shield size={22} />,
      label: "Scope ที่ใช้บ่อย",
      value: "payment.create",
      sub: `${activeCount} clients ใช้ scope นี้`,
      tone: "info",
    },
    {
      icon: <AlertTriangle size={22} />,
      label: "Clients เก่า (>180d)",
      value: inactiveCount,
      sub: "paused + revoked",
      tone: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => {
        const t = TONE_CLASS[item.tone];
        return (
          <Card key={i} className="py-0">
            <div className="flex items-center gap-3 px-5 py-4">
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-[11px]",
                  t.bg,
                  t.text,
                )}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-grey-500">{item.label}</p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                  {item.value}
                </p>
                <p className="mt-0.5 text-sm text-grey-500">{item.sub}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
