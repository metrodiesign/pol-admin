import { cn } from "@/lib/utils";
import { TONE_STYLE, type Tone } from "@/lib/control/status";
import { controlBadgeClass } from "@/components/control/shared/styles";
import type { ReactNode } from "react";

/**
 * Generic control-plane status pill. Status is never color-only — the label text
 * carries the meaning (a11y); domain-specific icons remain optional.
 */
export function ControlStatusBadge({
  tone,
  label,
  className,
  icon,
}: {
  tone: Tone;
  label: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(controlBadgeClass, TONE_STYLE[tone], className)}
    >
      {icon}
      {label}
    </span>
  );
}
