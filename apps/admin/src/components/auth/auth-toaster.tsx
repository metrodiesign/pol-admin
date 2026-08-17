"use client";

import { Check, X } from "lucide-react";

import type { AuthToast } from "./use-auth-toast";

interface AuthToasterProps {
  toasts: AuthToast[];
  onDismiss: (id: number) => void;
}

/** Fixed container แสดง toast ของ auth — icon/สีตาม variant (B4). aria-live ให้ screen reader อ่านผล. */
export function AuthToaster({ toasts, onDismiss }: AuthToasterProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-100 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2 rounded-control bg-grey-800 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          {t.variant === "success" ? (
            <Check className="size-4 shrink-0 text-success-light" />
          ) : (
            <X className="size-4 shrink-0 text-error-light" />
          )}
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="ปิดการแจ้งเตือน"
            className="ml-2 text-white/70 transition-colors hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
