import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/order";
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
        "inline-flex items-center whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold",
        ORDER_STATUS_STYLE[status],
        className,
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
