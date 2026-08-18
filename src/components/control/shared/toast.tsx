"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Tone } from "@/lib/control/status";

/**
 * Global control-plane toaster. A module-level store (not a hook) so any screen
 * can fire `showControlToast(...)` without prop drilling, and the toasts survive
 * client-side navigation because <ControlToaster/> is mounted once in the control
 * layout. ponytail: no toast dependency — repo has none; ~30 lines covers it.
 */
export interface ControlToast {
  id: number;
  message: string;
  tone: Tone;
}

let toasts: ControlToast[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function showControlToast(message: string, tone: Tone = "ok") {
  nextId += 1;
  const id = nextId;
  toasts = [...toasts, { id, message, tone }];
  emit();
  setTimeout(() => dismiss(id), 3500);
}

const ICON: Record<Tone, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warn: Info,
  info: Info,
  error: XCircle,
  muted: Info,
};

const ICON_COLOR: Record<Tone, string> = {
  ok: "text-success",
  warn: "text-warning",
  info: "text-info",
  error: "text-error",
  muted: "text-grey-500",
};

export function ControlToaster() {
  const items = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => toasts,
    () => toasts,
  );

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
      {items.map((t) => {
        const Icon = ICON[t.tone];
        return (
          <div
            key={t.id}
            className="flex items-center gap-2.5 rounded-xl bg-card px-4 py-3 text-sm font-medium text-foreground"
            style={{ boxShadow: "var(--shadow-dropdown)" }}
          >
            <Icon className={cn("size-4 shrink-0", ICON_COLOR[t.tone])} />
            <span className="pr-2">{t.message}</span>
            <button
              type="button"
              aria-label="ปิด"
              onClick={() => dismiss(t.id)}
              className="ml-auto grid size-5 place-items-center rounded-full text-grey-500 transition-colors hover:bg-[var(--action-hover)]"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
