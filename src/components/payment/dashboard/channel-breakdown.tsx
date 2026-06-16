import { CreditCard, QrCode, Calendar, Wallet, Building2 } from "lucide-react";
import { WidgetCard } from "@/components/dashboard/widget-card";
import type { ChannelBreakdown } from "@/lib/mock/dashboard-centropay";
import type { PaymentChannel } from "@/types/transaction";

const CHANNEL_ICON: Record<PaymentChannel, React.ElementType> = {
  card: CreditCard,
  qr: QrCode,
  installment: Calendar,
  wallet: Wallet,
  bank: Building2,
};

function fmtThb(n: number) {
  return (n / 1e6).toFixed(2) + "M";
}

interface ChannelBreakdownProps {
  channels: ChannelBreakdown[];
  totalFee: string;
  totalRefund: string;
  totalChargeback: string;
}

export function ChannelBreakdownCard({
  channels,
  totalFee,
  totalRefund,
  totalChargeback,
}: ChannelBreakdownProps) {
  return (
    <WidgetCard title="แยกตามช่องทางชำระ" subtitle="วันนี้ · จากทั้งหมด ฿16.58M">
      <div className="flex flex-col gap-[18px]">
        {channels.map((c) => {
          const Icon = CHANNEL_ICON[c.channel] ?? CreditCard;
          return (
            <div key={c.channel}>
              <div className="flex items-center gap-2.5">
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-grey-100"
                  style={{ color: c.color }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{c.label}</span>
                    <span className="ml-auto text-sm font-bold tabular-nums">
                      ฿{fmtThb(c.volume)}
                    </span>
                    <span className="min-w-[36px] text-right text-sm font-semibold text-grey-600">
                      {c.share}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-grey-200">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.share}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="my-1 h-px bg-grey-200" />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-grey-600">ค่าธรรมเนียมรวม</p>
            <p className="mt-0.5 text-base font-bold tabular-nums">{totalFee}</p>
          </div>
          <div>
            <p className="text-xs text-grey-600">คืนเงิน (Refund)</p>
            <p className="mt-0.5 text-base font-bold tabular-nums">{totalRefund}</p>
          </div>
          <div>
            <p className="text-xs text-grey-600">Chargeback</p>
            <p className="mt-0.5 text-base font-bold tabular-nums">{totalChargeback}</p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
