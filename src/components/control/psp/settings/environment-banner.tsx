import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { cardStyle } from "@/components/control/shared/styles";
import { cn } from "@/lib/utils";
import type { MerchantPaymentSettings } from "@/types/control/merchant-payment-settings";

export function EnvironmentBanner({
  settings,
  canManage,
  canRequestChange,
  disabledReason,
  onRequestChange,
}: {
  settings: MerchantPaymentSettings;
  canManage: boolean;
  canRequestChange: boolean;
  disabledReason: string | null;
  onRequestChange: () => void;
}) {
  const isLive = settings.environment === "live";
  const target = settings.environment === "live" ? "sandbox" : "live";

  return (
    <section
      className="flex flex-col gap-4 rounded-card bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
      style={cardStyle}
      aria-label="สภาพแวดล้อมการชำระเงิน"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck
          className={cn("mt-0.5 size-5 shrink-0", isLive ? "text-warning" : "text-grey-600")}
          aria-hidden
        />
        <div>
          <p className="text-xs font-medium text-grey-600">สภาพแวดล้อมปัจจุบัน</p>
          <p
            className={cn(
              "text-lg font-bold leading-7",
              isLive ? "text-warning" : "text-foreground",
            )}
          >
            {settings.environment.toUpperCase()}
          </p>
          {settings.pendingEnvironment ? (
            <p className="mt-1 text-sm text-warning">
              รออนุมัติเปลี่ยนเป็น {settings.pendingEnvironment.toUpperCase()}
              {settings.pendingApprovalId ? (
                <>
                  {" "}
                  <Link
                    className="font-semibold underline"
                    href={`/control/approvals/read?id=${encodeURIComponent(settings.pendingApprovalId)}`}
                  >
                    ดูคำขอ
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>

      {canManage ? (
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <button
            type="button"
            onClick={onRequestChange}
            disabled={!canRequestChange}
            className="inline-flex h-11 min-w-[180px] items-center justify-center rounded-control bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            ขอเปลี่ยนเป็น {target.toUpperCase()}
          </button>
          {!canRequestChange && disabledReason ? (
            <p className="text-xs text-grey-600">{disabledReason}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
