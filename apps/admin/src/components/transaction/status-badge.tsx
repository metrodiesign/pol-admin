import { PAYMENT_SESSION_STATUS_LABEL, PAYMENT_SESSION_STATUS_STYLE } from "@/lib/transaction";
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
        "inline-flex items-center whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold",
        PAYMENT_SESSION_STATUS_STYLE[status],
        className,
      )}
    >
      {PAYMENT_SESSION_STATUS_LABEL[status]}
    </span>
  );
}
