import { AlertTriangle, CheckCircle2, CircleAlert, Hourglass } from "lucide-react";

import { cardStyle } from "@/components/control/shared/styles";
import { cn } from "@/lib/utils";
import {
  currentReadinessStep,
  type ReadinessState,
  type ReadinessStep,
} from "@/lib/control/merchant-psp-settings";

const STATE_META: Record<
  ReadinessState,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  done: { label: "เสร็จแล้ว", icon: CheckCircle2, className: "text-success" },
  attention: { label: "ต้องดำเนินการ", icon: AlertTriangle, className: "text-warning" },
  blocked: { label: "ติดขัด", icon: CircleAlert, className: "text-error" },
  pending: { label: "รออนุมัติ", icon: Hourglass, className: "text-warning" },
};

export function ReadinessRail({ steps }: { steps: ReadinessStep[] }) {
  const current = currentReadinessStep(steps);
  return (
    <section
      className="rounded-card bg-card p-6"
      style={cardStyle}
      aria-label="ความพร้อมการตั้งค่า"
    >
      <ol className="flex flex-col gap-4 sm:flex-row sm:gap-3">
        {steps.map((step, index) => {
          const meta = STATE_META[step.state];
          const Icon = meta.icon;
          const isCurrent = step.id === current;
          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex flex-1 items-start gap-3 rounded-xl border p-3",
                isCurrent ? "border-primary bg-primary/4" : "border-[var(--divider)]",
              )}
            >
              <Icon className={cn("mt-0.5 size-5 shrink-0", meta.className)} aria-hidden />
              <div className="min-w-0">
                <p className="text-xs font-medium text-grey-600">
                  {index + 1}. {step.label}
                </p>
                <p className="text-sm font-semibold text-foreground">{step.detail}</p>
                <p className={cn("text-xs", meta.className)}>{meta.label}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
