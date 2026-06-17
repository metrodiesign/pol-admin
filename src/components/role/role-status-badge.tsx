import type { RoleStatus } from "@/types/role";
import { cn } from "@/lib/utils";

/** ป้ายสถานะการใช้งานบทบาท — สีไม่ใช่ตัวสื่อความหมายเดียว มีข้อความกำกับเสมอ. */
const statusStyles: Record<RoleStatus, { dot: string; chip: string; label: string }> = {
  active: { dot: "bg-success", chip: "bg-success/16 text-success-dark", label: "ใช้งาน" },
  inactive: { dot: "bg-grey-500", chip: "bg-grey-500/16 text-grey-600", label: "ปิดใช้งาน" },
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
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold whitespace-nowrap",
        style.chip,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

/** ตัวเลือกสถานะสำหรับฟอร์ม create/edit. */
export const STATUS_OPTIONS: { value: RoleStatus; label: string }[] = [
  { value: "active", label: "ใช้งาน" },
  { value: "inactive", label: "ปิดใช้งาน" },
];
