import type React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { ACCENT_HEX } from "@/components/charts/chart-colors";
import { paymentSummaryStats, type PaymentSummaryStat } from "@/lib/mock/main";
import { cn } from "@/lib/utils";

// Card 1 — ยอดรับชำระวันนี้: stacked banknotes + coin (revenue)
function IllustrationRevenue({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-full">
      <ellipse cx="60" cy="104" rx="42" ry="5" fill={color} opacity="0.08" />
      {/* Back banknote */}
      <rect x="22" y="44" width="64" height="34" rx="6" fill={color} opacity="0.40" />
      {/* Mid banknote */}
      <rect x="28" y="52" width="64" height="34" rx="6" fill={color} opacity="0.60" />
      {/* Front banknote */}
      <rect x="34" y="60" width="64" height="34" rx="6" fill={color} opacity="0.82" />
      {/* Front banknote center coin */}
      <circle cx="66" cy="77" r="9" fill="white" opacity="0.22" />
      <path d="M66 72 v10 M62.5 74.5 h6 a2.5 2.5 0 0 1 0 5 h-6 M62.5 79.5 h6 a2.5 2.5 0 0 1 0 5 h-6" stroke="white" strokeWidth="1.4" opacity="0.5" strokeLinecap="round" fill="none" />
      {/* Side ticks */}
      <rect x="40" y="66" width="8" height="3" rx="1.5" fill="white" opacity="0.2" />
      <rect x="84" y="85" width="8" height="3" rx="1.5" fill="white" opacity="0.2" />
      {/* Floating coin */}
      <circle cx="92" cy="50" r="12" fill={color} opacity="0.72" />
      <path d="M92 44 v12 M88.5 47 h6 a2.5 2.5 0 0 1 0 5 h-6 M88.5 52 h6 a2.5 2.5 0 0 1 0 5 h-6" stroke="white" strokeWidth="1.6" opacity="0.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Card 2 — ลิงก์รอชำระ: chain link + pending clock
function IllustrationPendingLink({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-full">
      <ellipse cx="60" cy="104" rx="42" ry="5" fill={color} opacity="0.08" />
      {/* Chain link — left ring */}
      <rect x="26" y="50" width="40" height="24" rx="12" stroke={color} strokeWidth="8" fill="none" opacity="0.80" transform="rotate(-30 46 62)" />
      {/* Chain link — right ring */}
      <rect x="54" y="50" width="40" height="24" rx="12" stroke={color} strokeWidth="8" fill="none" opacity="0.56" transform="rotate(-30 74 62)" />
      {/* Pending clock */}
      <circle cx="86" cy="84" r="16" fill={color} opacity="0.82" />
      <circle cx="86" cy="84" r="16" stroke="white" strokeWidth="1.5" opacity="0.2" fill="none" />
      <path d="M86 84 V75 M86 84 l7 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// Card 3 — ธุรกรรมสำเร็จ: receipt with success check
function IllustrationSuccess({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-full">
      <ellipse cx="60" cy="104" rx="42" ry="5" fill={color} opacity="0.08" />
      {/* Receipt */}
      <path d="M34 30 h44 v60 l-7 -5 -7 5 -7 -5 -8 5 -8 -5 V30 Z" fill={color} opacity="0.40" />
      <rect x="42" y="40" width="28" height="3" rx="1.5" fill="white" opacity="0.45" />
      <rect x="42" y="50" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />
      <rect x="42" y="60" width="24" height="3" rx="1.5" fill="white" opacity="0.4" />
      {/* Success check badge */}
      <circle cx="80" cy="78" r="20" fill={color} opacity="0.88" />
      <path d="M71 78 l6 6 12 -13" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
    </svg>
  );
}

// Card 4 — ธุรกรรมไม่สำเร็จ: receipt with failure cross
function IllustrationFailed({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-full">
      <ellipse cx="60" cy="104" rx="42" ry="5" fill={color} opacity="0.08" />
      {/* Receipt */}
      <path d="M34 30 h44 v60 l-7 -5 -7 5 -7 -5 -8 5 -8 -5 V30 Z" fill={color} opacity="0.40" />
      <rect x="42" y="40" width="28" height="3" rx="1.5" fill="white" opacity="0.45" />
      <rect x="42" y="50" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />
      <rect x="42" y="60" width="24" height="3" rx="1.5" fill="white" opacity="0.4" />
      {/* Failure cross badge */}
      <circle cx="80" cy="78" r="20" fill={color} opacity="0.88" />
      <path d="M73 71 l14 14 M87 71 l-14 14" stroke="white" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.95" />
    </svg>
  );
}

const ILLUSTRATIONS = [
  IllustrationRevenue,
  IllustrationPendingLink,
  IllustrationSuccess,
  IllustrationFailed,
];

function PaymentSummaryCard({
  stat,
  IllustrationComponent,
  captionMedium,
}: {
  stat: PaymentSummaryStat;
  IllustrationComponent: React.ComponentType<{ color: string }>;
  captionMedium?: boolean;
}) {
  const TrendIcon = stat.trend.up ? ArrowUp : ArrowDown;
  return (
    <div className="dashboard-card flex h-full items-center justify-between gap-3 overflow-hidden p-6">
      <div className="min-w-0">
        <p className="text-base font-semibold leading-[22px] text-grey-800">{stat.title}</p>
        <p
          className="mt-3 text-3xl font-bold leading-[48px] text-grey-800"
          style={{ fontFamily: "var(--font-barlow, 'Barlow', 'Public Sans Variable', sans-serif)" }}
        >
          {stat.total}
        </p>
        <div className="mt-2 flex flex-col items-start gap-1.5 text-sm">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              stat.trend.up ? "bg-success/16 text-success" : "bg-error/16 text-error",
            )}
          >
            <TrendIcon className="size-3.5" />
            {stat.trend.up ? "+" : "-"}
            {stat.trend.value}%
          </span>
          <span className={cn("whitespace-nowrap text-grey-600", captionMedium && "font-medium")}>{stat.caption}</span>
        </div>
      </div>
      <div className="size-[88px] shrink-0">
        <IllustrationComponent color={ACCENT_HEX[stat.color]} />
      </div>
    </div>
  );
}

export function PaymentSummaryWidgets() {
  return (
    <>
      {paymentSummaryStats.map((stat, i) => {
        const IllustrationComponent = ILLUSTRATIONS[i] ?? ILLUSTRATIONS[0]!;
        return (
          <div key={stat.title} className="mmd:col-span-3">
            <PaymentSummaryCard stat={stat} IllustrationComponent={IllustrationComponent} captionMedium={i > 0} />
          </div>
        );
      })}
    </>
  );
}
