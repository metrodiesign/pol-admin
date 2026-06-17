import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RbacPermissionProgressProps {
  /** จำนวนสิทธิ์ที่ได้รับ */
  value: number;
  /** จำนวนสิทธิ์ทั้งหมดใน catalog */
  max: number;
  className?: string;
}

/** Progress bar + ป้าย `{granted}/{total}` (REQ-3.5). `max` = ขนาด catalog จริง. */
export function RbacPermissionProgress({
  value,
  max,
  className,
}: RbacPermissionProgressProps) {
  return (
    <div className={cn("flex w-36 flex-col gap-1", className)}>
      <span className="text-xs font-semibold tabular-nums text-grey-700">
        {value}/{max}
      </span>
      <Progress value={value} max={max} className="w-full" />
    </div>
  );
}
