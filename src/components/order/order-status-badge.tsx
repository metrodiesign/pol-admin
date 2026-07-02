import { STATUS_LABEL, STATUS_STYLE, STATUS_DOT } from "@/lib/order";
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
        STATUS_STYLE[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}
