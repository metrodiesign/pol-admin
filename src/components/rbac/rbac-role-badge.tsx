import type { RoleColor } from "@/types/rbac";
import { cn } from "@/lib/utils";

/**
 * จุดสี + ชื่อบทบาทไทย ตาม `RoleColor`. สีไม่ใช่ตัวสื่อความหมายเดียว — มีชื่อกำกับเสมอ (REQ-11.3).
 */
const roleColorStyles: Record<RoleColor, { dot: string; chip: string }> = {
  red: { dot: "bg-error", chip: "bg-error/16 text-error-dark" },
  blue: { dot: "bg-info", chip: "bg-info/16 text-info-dark" },
  green: { dot: "bg-success", chip: "bg-success/16 text-success-dark" },
  amber: { dot: "bg-warning", chip: "bg-warning/16 text-warning-dark" },
  gray: { dot: "bg-grey-500", chip: "bg-grey-500/16 text-grey-600" },
};

interface RbacRoleBadgeProps {
  color: RoleColor;
  name: string;
  className?: string;
}

export function RbacRoleBadge({ color, name, className }: RbacRoleBadgeProps) {
  const style = roleColorStyles[color];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-bold whitespace-nowrap",
        style.chip,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", style.dot)} />
      {name}
    </span>
  );
}
