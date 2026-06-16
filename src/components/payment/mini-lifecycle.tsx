import { cn } from "@/lib/utils";
import type { StepState } from "./lifecycle-track";

interface MiniLifecycleProps {
  /** Array of step states in order: [authorize, capture, void|refund] */
  states: StepState[];
  className?: string;
}

const DOT_CLASSES: Record<StepState, string> = {
  done:   "bg-success",
  active: "bg-primary animate-pulse",
  failed: "bg-error",
  idle:   "bg-grey-300",
};

export function MiniLifecycle({ states, className }: MiniLifecycleProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {states.map((state, i) => (
        <span key={i} className={cn("size-2 rounded-full shrink-0", DOT_CLASSES[state])} />
      ))}
    </div>
  );
}
