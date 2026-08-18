import { LIST_STATUS_LABEL, LIST_STATUS_STYLE } from "@/lib/transaction";
import type { OrderStatus } from "@/types/order-payment";
import { cn } from "@/lib/utils";

export function TransactionListStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold",
        LIST_STATUS_STYLE[status],
        className,
      )}
    >
      {LIST_STATUS_LABEL[status]}
    </span>
  );
}
