import type { RoleColor } from "@/types/admin/role";
import { cn } from "@/lib/utils";

/**
 * จุดสี + ชื่อบทบาทไทย ตาม `RoleColor`. สีไม่ใช่ตัวสื่อความหมายเดียว — มีชื่อกำกับเสมอ (REQ-11.3).
 */
const roleColorStyles: Record<
  RoleColor,
  { dot: string; chip: string; label: string }
> = {
  red: { dot: "bg-error", chip: "bg-error/16 text-error-dark", label: "แดง" },
  orange: {
    dot: "bg-orange-500",
    chip: "bg-orange-500/16 text-orange-700",
    label: "ส้ม",
  },
  amber: {
    dot: "bg-warning",
    chip: "bg-warning/16 text-warning-dark",
    label: "เหลือง",
  },
  green: {
    dot: "bg-success",
    chip: "bg-success/16 text-success-dark",
    label: "เขียว",
  },
  teal: {
    dot: "bg-teal-500",
    chip: "bg-teal-500/16 text-teal-700",
    label: "เขียวน้ำทะเล",
  },
  cyan: {
    dot: "bg-info",
    chip: "bg-info/16 text-info-dark",
    label: "ฟ้าคราม",
  },
  blue: {
    dot: "bg-primary",
    chip: "bg-primary/16 text-primary-dark",
    label: "น้ำเงิน",
  },
  indigo: {
    dot: "bg-indigo-500",
    chip: "bg-indigo-500/16 text-indigo-700",
    label: "คราม",
  },
  violet: {
    dot: "bg-violet-500",
    chip: "bg-violet-500/16 text-violet-700",
    label: "ม่วงน้ำเงิน",
  },
  purple: {
    dot: "bg-secondary",
    chip: "bg-secondary/16 text-secondary-dark",
    label: "ม่วง",
  },
  pink: {
    dot: "bg-pink-500",
    chip: "bg-pink-500/16 text-pink-700",
    label: "ชมพู",
  },
  gray: {
    dot: "bg-grey-500",
    chip: "bg-grey-500/16 text-grey-600",
    label: "เทา",
  },
};

/** ตัวเลือกสีป้ายกำกับ (single source) — เรียงตามเฉดสี. ใช้ใน create/edit. */
export const ROLE_COLOR_OPTIONS: { value: RoleColor; label: string; dot: string }[] =
  (Object.keys(roleColorStyles) as RoleColor[]).map((value) => ({
    value,
    label: roleColorStyles[value].label,
    dot: roleColorStyles[value].dot,
  }));

interface RoleBadgeProps {
  color: RoleColor;
  name: string;
  className?: string;
}

export function RoleBadge({ color, name, className }: RoleBadgeProps) {
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
