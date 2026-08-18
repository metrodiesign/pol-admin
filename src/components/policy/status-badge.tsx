import type { PolicyStatus } from "@/types/policy";
import { cn } from "@/lib/utils";

/**
 * Single source ของ label + สีต่อสถานะกรมธรรม์ — สีไม่ใช่ตัวสื่อความหมายเดียว
 * (มีข้อความกำกับเสมอ, REQ-9.2). tabs reuse map นี้ (เลี่ยง duplicate token, F-ui-13).
 */
export const POLICY_STATUS_META: Record<PolicyStatus, { chip: string; label: string }> = {
  active: { chip: "bg-success/16 text-success-dark", label: "มีผลบังคับ" },
  due_soon: { chip: "bg-warning/16 text-warning-dark", label: "ใกล้ครบกำหนด" },
  awaiting: { chip: "bg-info/16 text-info-dark", label: "รอชำระเบี้ย" },
  lapsed: { chip: "bg-grey-500/16 text-grey-600", label: "ขาดอายุ" },
  cancelled: { chip: "bg-error/16 text-error-dark", label: "ยกเลิก" },
};

interface PolicyStatusBadgeProps {
  status: PolicyStatus;
  className?: string;
}

export function PolicyStatusBadge({ status, className }: PolicyStatusBadgeProps) {
  const style = POLICY_STATUS_META[status];
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
