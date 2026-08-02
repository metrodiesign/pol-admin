import { LIST_STATUS_LABEL, LIST_STATUS_STYLE, LIST_STATUS_DOT } from "@/lib/transaction";
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
        "inline-flex h-6 items-center gap-1.5 rounded-md px-1.5 text-xs font-bold",
        LIST_STATUS_STYLE[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", LIST_STATUS_DOT[status])} />
      {LIST_STATUS_LABEL[status]}
    </span>
  );
}
