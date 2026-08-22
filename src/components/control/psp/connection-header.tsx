import { Activity, CircleAlert, Clock3, Hourglass, Power } from "lucide-react";

import { ControlStatusBadge } from "@/components/control/shared/status-badge";
import { StatusSpine } from "@/components/control/shared/status-spine";
import {
  APPROVAL_LABEL,
  HEALTH_LABEL,
  PROVIDER_LABEL,
  approvalTone,
  enabledLabel,
  enabledTone,
  healthTone,
} from "@/lib/control/psp";
import type { ApprovalState, PspHealth, PspProvider } from "@/types/control/psp-connection";

function ApprovalIcon({ state }: { state: ApprovalState }) {
  if (state === "pending") return <Hourglass className="size-4" />;
  if (state === "unavailable") return <CircleAlert className="size-4" />;
  return <Clock3 className="size-4" />;
}

function StateBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--divider)] bg-background px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-grey-500">{label}</p>
      {children}
    </div>
  );
}

export function ConnectionHeader({
  connectionId,
  provider,
  merchantName,
  enabled,
  health,
  approvalState,
}: {
  connectionId?: string;
  provider: PspProvider | null;
  merchantName: string | null;
  enabled: boolean;
  health: PspHealth;
  approvalState: ApprovalState;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="grid grid-cols-1 gap-4 p-5 mmd:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] mmd:p-6">
        <div className="flex min-w-0 items-stretch gap-3">
          <StatusSpine tone={healthTone(health)} className="h-auto min-h-16" />
          <div className="min-w-0">
            <p className="text-overline text-grey-500">Payment operator control room</p>
            <h1 className="text-h5 text-foreground">
              {provider ? PROVIDER_LABEL[provider] : "เลือก PSP"}
            </h1>
            <p className="mt-1 truncate text-sm font-semibold text-grey-700">
              {merchantName ?? "เลือก Merchant"}
            </p>
            {connectionId ? (
              <p className="text-data mt-1 break-all text-xs text-grey-500">{connectionId}</p>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:col-span-full sm:grid-cols-3 mmd:col-span-3">
          <StateBlock label="Enabled">
            <ControlStatusBadge
              tone={enabledTone(enabled)}
              label={enabledLabel(enabled)}
              icon={<Power className="size-4" />}
            />
          </StateBlock>
          <StateBlock label="Health">
            <ControlStatusBadge
              tone={healthTone(health)}
              label={HEALTH_LABEL[health]}
              icon={<Activity className="size-4" />}
            />
          </StateBlock>
          <StateBlock label="Approval">
            <ControlStatusBadge
              tone={approvalTone(approvalState)}
              label={APPROVAL_LABEL[approvalState]}
              icon={<ApprovalIcon state={approvalState} />}
            />
          </StateBlock>
        </div>
      </div>
    </section>
  );
}
