import type { OrgUnitStatus } from "@/types/organization/org-unit";
import { cn } from "@/lib/utils";

/** ป้ายสถานะการใช้งาน org unit — สีไม่ใช่ตัวสื่อความหมายเดียว มีข้อความกำกับเสมอ. */
const statusStyles: Record<OrgUnitStatus, { chip: string; label: string }> = {
  active: { chip: "bg-success/16 text-success-dark", label: "ใช้งาน" },
  inactive: { chip: "bg-grey-500/16 text-grey-600", label: "ปิดใช้งาน" },
};

/** map isActive (backend) -> ค่าใช้ใน UI. */
export function statusOf(isActive: boolean): OrgUnitStatus {
  return isActive ? "active" : "inactive";
}

interface OrgUnitStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function OrgUnitStatusBadge({ isActive, className }: OrgUnitStatusBadgeProps) {
  const style = statusStyles[statusOf(isActive)];
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

/** ตัวเลือกสถานะสำหรับ filter + ฟอร์ม edit. */
export const STATUS_OPTIONS: { value: OrgUnitStatus; label: string }[] = [
  { value: "active", label: "ใช้งาน" },
  { value: "inactive", label: "ปิดใช้งาน" },
];
