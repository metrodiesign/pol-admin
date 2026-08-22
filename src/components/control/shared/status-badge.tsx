import { cn } from "@/lib/utils";
import { TONE_STYLE, TONE_SOLID, type Tone } from "@/lib/control/status";
import type { ReactNode } from "react";

/**
 * Generic control-plane status pill: dot + label. Status is never color-only —
 * the label text carries the meaning (a11y). Reused by every control screen.
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
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-1.5 text-xs font-bold",
        TONE_STYLE[tone],
        className,
      )}
    >
      {icon ?? <span className={cn("size-1.5 rounded-full", TONE_SOLID[tone])} />}
      {label}
    </span>
  );
}
