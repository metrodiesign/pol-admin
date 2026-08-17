import { cn } from "@/lib/utils";
import { TONE_SOLID, type Tone } from "@/lib/control/status";

/**
 * Health spine — the control-plane signature element. A vertical state bar shown
 * as the leading cell of a list row (or on a card). Decorative only: the same
 * state always appears in a ControlStatusBadge alongside it, so the color is never
 * the sole carrier of meaning.
 */
export function StatusSpine({
  tone,
  className,
}: {
  tone: Tone;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("status-spine h-8", TONE_SOLID[tone], className)}
    />
  );
}
