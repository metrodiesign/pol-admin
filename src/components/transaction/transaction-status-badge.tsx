import { PAYMENT_SESSION_STATUS_LABEL, PAYMENT_SESSION_STATUS_STYLE, PAYMENT_SESSION_STATUS_DOT } from "@/lib/transaction";
import type { PaymentSessionStatus } from "@/types/order-payment";
import { cn } from "@/lib/utils";

export function TransactionStatusBadge({
  status,
  className,
}: {
  status: PaymentSessionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-1.5 text-xs font-bold",
        PAYMENT_SESSION_STATUS_STYLE[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", PAYMENT_SESSION_STATUS_DOT[status])} />
      {PAYMENT_SESSION_STATUS_LABEL[status]}
    </span>
  );
}
