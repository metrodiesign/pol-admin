import type { PolicyStatus } from "@/types/policy";
import { cn } from "@/lib/utils";

/**
 * Single source ของ label + สีต่อสถานะกรมธรรม์ — สีไม่ใช่ตัวสื่อความหมายเดียว
 * (มี dot + ข้อความเสมอ, REQ-9.2). tabs reuse map นี้ (เลี่ยง duplicate token, F-ui-13).
 */
export const POLICY_STATUS_META: Record<
  PolicyStatus,
  { dot: string; chip: string; label: string }
> = {
  active: { dot: "bg-success", chip: "bg-success/16 text-success-dark", label: "มีผลบังคับ" },
  due_soon: { dot: "bg-warning", chip: "bg-warning/16 text-warning-dark", label: "ใกล้ครบกำหนด" },
  awaiting: { dot: "bg-info", chip: "bg-info/16 text-info-dark", label: "รอชำระเบี้ย" },
  lapsed: { dot: "bg-grey-500", chip: "bg-grey-500/16 text-grey-600", label: "ขาดอายุ" },
  cancelled: { dot: "bg-error", chip: "bg-error/16 text-error-dark", label: "ยกเลิก" },
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
