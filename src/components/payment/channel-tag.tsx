import { cn } from "@/lib/utils";
import type { PaymentChannel } from "@/types/transaction";

const CHANNEL_CONFIG: Record<
  PaymentChannel,
  { label: string; dotClass: string }
> = {
  card:        { label: "บัตรเครดิต/เดบิต", dotClass: "bg-blue-600" },
  qr:          { label: "PromptPay QR",      dotClass: "bg-emerald-600" },
  installment: { label: "ผ่อนชำระ",          dotClass: "bg-violet-600" },
  wallet:      { label: "E-Wallet",          dotClass: "bg-amber-600" },
  bank:        { label: "Mobile Banking",    dotClass: "bg-cyan-600" },
};

interface ChannelTagProps {
  channel: PaymentChannel;
  className?: string;
}

export function ChannelTag({ channel, className }: ChannelTagProps) {
  const config = CHANNEL_CONFIG[channel] ?? { label: channel, dotClass: "bg-grey-400" };
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("size-2 shrink-0 rounded-full", config.dotClass)} />
      <span className="text-sm">{config.label}</span>
    </span>
  );
}
