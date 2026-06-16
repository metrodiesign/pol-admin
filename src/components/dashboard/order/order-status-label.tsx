import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

interface OrderStatusLabelProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  completed: "bg-[rgba(34,197,94,0.16)] text-[rgb(17,141,87)]",
  pending: "bg-[rgba(255,171,0,0.16)] text-[rgb(183,110,0)]",
  cancelled: "bg-[rgba(255,86,48,0.16)] text-[rgb(183,29,24)]",
  refunded: "bg-[rgba(145,158,171,0.16)] text-foreground",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function OrderStatusLabel({ status, className }: OrderStatusLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold leading-[18px]",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
