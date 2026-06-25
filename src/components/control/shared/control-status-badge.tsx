import { cn } from "@/lib/utils";
import { TONE_STYLE, TONE_SOLID, type Tone } from "@/lib/control/status";

/**
 * Generic control-plane status pill: dot + label. Status is never color-only —
 * the label text carries the meaning (a11y). Reused by every control screen.
 */
export function ControlStatusBadge({
  tone,
  label,
  className,
}: {
  tone: Tone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-1.5 text-xs font-bold",
        TONE_STYLE[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", TONE_SOLID[tone])} />
      {label}
    </span>
  );
}
