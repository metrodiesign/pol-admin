import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { WidgetCard } from "@/components/dashboard/widget-card";
import type { TopOriginator } from "@/lib/mock/dashboard-centropay";

const TOTAL_TODAY = 16588720;

interface TopOriginatorsProps {
  originators: TopOriginator[];
}

export function TopOriginators({ originators }: TopOriginatorsProps) {
  return (
    <WidgetCard
      title="ผู้สร้างรายการสูงสุด"
      subtitle="วันนี้ · เรียงตามมูลค่า"
      action={
        <Link
          href="/branches"
          className="inline-flex items-center gap-0.5 text-sm text-grey-600 hover:text-primary transition-colors"
        >
          ดูทั้งหมด
          <ChevronRight className="size-3.5" />
        </Link>
      }
      bodyClassName="!p-0"
    >
      {originators.map((o, i) => (
        <Link
          key={o.code}
          href={o.navTarget}
          className="flex items-center gap-3 border-b border-[rgba(145,158,171,0.12)] px-6 py-3 last:border-0 transition-colors hover:bg-grey-100"
        >
          {/* Rank */}
          <div className="grid size-[22px] shrink-0 place-items-center rounded-md bg-grey-200 text-xs font-bold text-grey-600">
            {i + 1}
          </div>
          {/* Avatar */}
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary-dark to-primary text-xs font-bold text-white -tracking-tight">
            {o.code}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{o.name}</p>
            <p className="mt-0.5 text-xs text-grey-600">
              {o.type} · {o.count.toLocaleString("th-TH")} รายการ
            </p>
          </div>
          {/* Amount */}
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold tabular-nums">
              ฿{(o.amount / 1e6).toFixed(2)}M
            </p>
            <p className="text-xs font-semibold text-success-dark">
              {Math.round((o.amount / TOTAL_TODAY) * 100)}% ของวันนี้
            </p>
          </div>
        </Link>
      ))}
    </WidgetCard>
  );
}
