import { cn } from "@/lib/utils";
import { Check, X, Clock, CircleDot } from "lucide-react";

export type LifecycleStep =
  | "authorize"
  | "capture"
  | "void"
  | "refund";

export type StepState = "done" | "active" | "idle" | "failed";

export interface LifecycleStepConfig {
  step: LifecycleStep;
  state: StepState;
  label: string;
  ts?: string;
}

const STEP_LABELS: Record<LifecycleStep, string> = {
  authorize: "Authorize",
  capture: "Capture",
  void: "Void",
  refund: "Refund",
};

function StepIcon({ state }: { state: StepState }) {
  if (state === "done")
    return <Check className="size-3.5 stroke-[2.5]" />;
  if (state === "failed")
    return <X className="size-3.5 stroke-[2.5]" />;
  if (state === "active")
    return <Clock className="size-3.5" />;
  return <CircleDot className="size-3.5 opacity-40" />;
}

const STATE_CLASSES: Record<StepState, { dot: string; line: string; label: string }> = {
  done:   { dot: "bg-success text-white", line: "bg-success", label: "text-success-dark font-semibold" },
  active: { dot: "bg-primary text-white", line: "bg-grey-200", label: "text-primary font-semibold" },
  failed: { dot: "bg-error text-white",   line: "bg-grey-200", label: "text-error-dark font-semibold" },
  idle:   { dot: "bg-grey-200 text-grey-500", line: "bg-grey-200", label: "text-grey-500" },
};

interface LifecycleTrackProps {
  steps: LifecycleStepConfig[];
  className?: string;
}

export function LifecycleTrack({ steps, className }: LifecycleTrackProps) {
  return (
    <div className={cn("flex items-start gap-0", className)}>
      {steps.map((s, idx) => {
        const cls = STATE_CLASSES[s.state];
        const isLast = idx === steps.length - 1;
        return (
          <div key={`${s.step}-${idx}`} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  cls.dot,
                )}
              >
                <StepIcon state={s.state} />
              </div>
              {!isLast && (
                <div className={cn("h-px flex-1", cls.line)} />
              )}
            </div>
            <div className="mt-1.5 text-center">
              <p className={cn("text-xs", cls.label)}>
                {s.label ?? STEP_LABELS[s.step]}
              </p>
              {s.ts && (
                <p className="mt-0.5 text-[10px] text-grey-500">{s.ts}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
