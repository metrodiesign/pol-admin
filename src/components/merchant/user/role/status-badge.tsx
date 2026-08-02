import type { RoleStatus } from "@/types/merchant/user/role";
import { cn } from "@/lib/utils";

/** ป้ายสถานะการใช้งานบทบาท. */
const statusStyles: Record<RoleStatus, { chip: string; label: string }> = {
  active: { chip: "bg-success/16 text-success-dark", label: "ใช้งาน" },
  inactive: { chip: "bg-error/16 text-error-dark", label: "ปิดใช้งาน" },
};

interface RoleStatusBadgeProps {
  status: RoleStatus;
  className?: string;
}

export function RoleStatusBadge({ status, className }: RoleStatusBadgeProps) {
  const style = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold",
        style.chip,
        className,
      )}
    >
      {style.label}
    </span>
  );
}

/** ตัวเลือกสถานะสำหรับฟอร์ม create/edit. */
export const STATUS_OPTIONS: { value: RoleStatus; label: string }[] = [
  { value: "active", label: "ใช้งาน" },
  { value: "inactive", label: "ปิดใช้งาน" },
];
