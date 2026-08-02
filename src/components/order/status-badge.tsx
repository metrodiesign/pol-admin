import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, ORDER_STATUS_DOT } from "@/lib/order";
import type { OrderStatus } from "@/types/order-payment";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({
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
        ORDER_STATUS_STYLE[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", ORDER_STATUS_DOT[status])} />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
