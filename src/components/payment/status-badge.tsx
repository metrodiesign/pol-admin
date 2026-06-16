import { cn } from "@/lib/utils";

export type StatusVariant =
  | "succeeded"
  | "pending"
  | "processing"
  | "failed"
  | "voided"
  | "refunded"
  | "authorized"
  | "active"
  | "paused"
  | "sent"
  | "queued"
  | "draft"
  | "partial"
  | "paid"
  | "overdue"
  | "expired"
  | "lapsed"
  | "due"
  | "cancelled"
  | "disabled"
  | "revoked";

const STATUS_CONFIG: Record<
  StatusVariant,
  { label: string; className: string }
> = {
  succeeded:   { label: "สำเร็จ",          className: "bg-success/12 text-success-dark" },
  paid:        { label: "ชำระแล้ว",         className: "bg-success/12 text-success-dark" },
  active:      { label: "พร้อมใช้งาน",     className: "bg-success/12 text-success-dark" },
  sent:        { label: "ส่งสำเร็จ",        className: "bg-success/12 text-success-dark" },
  pending:     { label: "รอชำระ",           className: "bg-warning/12 text-warning-dark" },
  processing:  { label: "กำลังประมวลผล",   className: "bg-primary/10 text-primary" },
  authorized:  { label: "อนุมัติแล้ว",      className: "bg-primary/10 text-primary" },
  queued:      { label: "รอส่ง",            className: "bg-primary/10 text-primary" },
  draft:       { label: "แบบร่าง",          className: "bg-grey-500/10 text-grey-600" },
  due:         { label: "ใกล้ครบกำหนด",    className: "bg-warning/12 text-warning-dark" },
  partial:     { label: "ชำระบางส่วน",      className: "bg-warning/12 text-warning-dark" },
  paused:      { label: "พักใช้งาน",        className: "bg-warning/12 text-warning-dark" },
  failed:      { label: "ล้มเหลว",          className: "bg-error/12 text-error-dark" },
  overdue:     { label: "เกินกำหนด",        className: "bg-error/12 text-error-dark" },
  lapsed:      { label: "ขาดอายุ",          className: "bg-error/12 text-error-dark" },
  voided:      { label: "ยกเลิก",           className: "bg-grey-500/10 text-grey-600" },
  refunded:    { label: "คืนเงิน",          className: "bg-primary/10 text-primary" },
  expired:     { label: "หมดอายุ",          className: "bg-grey-500/10 text-grey-600" },
  cancelled:   { label: "ยกเลิก",           className: "bg-grey-500/10 text-grey-600" },
  disabled:    { label: "ปิดใช้งาน",        className: "bg-grey-500/10 text-grey-600" },
  revoked:     { label: "ถูกเพิกถอน",       className: "bg-error/12 text-error-dark" },
};

interface StatusBadgeProps {
  status: StatusVariant;
  /** Override display label */
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-grey-500/10 text-grey-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-80" />
      {label ?? config.label}
    </span>
  );
}
