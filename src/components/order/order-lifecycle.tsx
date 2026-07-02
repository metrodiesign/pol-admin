import { lifecycleStage } from "@/lib/order";
import type { OrderStatus } from "@/types/order-payment";
import { cn } from "@/lib/utils";

// 4-dot horizontal stepper: ●—●—●—●
// สี dot/connector อิงจาก lifecycleStage(status) → { done, active, tone }
export function OrderLifecycle({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const { done, active, tone } = lifecycleStage(status);

  return (
    <div className={cn("flex items-center", className)}>
      {Array.from({ length: 4 }, (_, i) => {
        const isActive = i === done && active > 0;
        return (
          <div key={i} className="flex items-center">
            {i > 0 && (
              <span
                className={cn(
                  "h-[2px] w-3",
                  // connector เขียวเมื่อ dot สองฝั่งเป็น done ทั้งคู่
                  i <= done - 1 ? "bg-success" : "bg-grey-300",
                )}
              />
            )}
            <span
              className={cn(
                "size-2.5 rounded-full",
                i < done
                  ? "bg-success"
                  : isActive
                    ? tone === "ok"
                      ? "bg-success"
                      : tone === "error"
                        ? "bg-error"
                        : "bg-grey-300"
                    : "border border-grey-300 bg-transparent",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
