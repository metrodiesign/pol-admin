"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "info" | "warning";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastOptions = {
  description?: string;
  duration?: number;
  action?: ToastAction;
};

type ToastItem = {
  id: number;
  variant: ToastVariant;
  message: string;
  description?: string;
  duration: number;
  action?: ToastAction;
};

type ToastApi = {
  success: (message: string, opts?: ToastOptions) => void;
  error: (message: string, opts?: ToastOptions) => void;
  info: (message: string, opts?: ToastOptions) => void;
  warning: (message: string, opts?: ToastOptions) => void;
  dismiss: (id: number) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    containerCls: string;
    iconCls: string;
    progressCls: string;
  }
> = {
  success: {
    Icon: CheckCircle,
    containerCls:
      "border-success/20 bg-success-lighter dark:bg-success-darker/30",
    iconCls: "text-success-dark dark:text-success-light",
    progressCls: "bg-success",
  },
  error: {
    Icon: XCircle,
    containerCls: "border-error/20 bg-error-lighter dark:bg-error-darker/30",
    iconCls: "text-error-dark dark:text-error-light",
    progressCls: "bg-error",
  },
  info: {
    Icon: Info,
    containerCls: "border-info/20 bg-info-lighter dark:bg-info-darker/30",
    iconCls: "text-info-dark dark:text-info-light",
    progressCls: "bg-info",
  },
  warning: {
    Icon: AlertTriangle,
    containerCls:
      "border-warning/20 bg-warning-lighter dark:bg-warning-darker/30",
    iconCls: "text-warning-dark dark:text-warning-light",
    progressCls: "bg-warning",
  },
};

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const { variant, message, description, duration, action, id } = toast;
  const { Icon, containerCls, iconCls, progressCls } = VARIANT_CONFIG[variant];

  // Reduced-motion check
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Progress bar width via CSS animation
  const progressStyle: React.CSSProperties = prefersReduced
    ? { width: "0%" }
    : {
        width: "100%",
        animationName: "toast-progress",
        animationDuration: `${duration}ms`,
        animationTimingFunction: "linear",
        animationFillMode: "forwards",
      };

  return (
    <div
      className={cn(
        "no-print relative flex w-full items-start gap-3 overflow-hidden rounded-control border p-3 shadow-z8",
        "animate-in slide-in-from-right-8 fade-in-0 duration-200",
        containerCls,
      )}
    >
      {/* Icon */}
      <Icon
        aria-hidden
        className={cn("mt-0.5 size-5 shrink-0", iconCls)}
      />

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-grey-800 dark:text-grey-100">
          {message}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-grey-600 dark:text-grey-400">
            {description}
          </p>
        )}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              onDismiss(id);
            }}
            className="mt-1.5 text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        aria-label="ปิด"
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-full p-0.5 text-grey-500 transition-colors hover:bg-black/8 hover:text-grey-800 dark:hover:bg-white/8 dark:hover:text-grey-100"
      >
        <X className="size-3.5" />
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div
          aria-hidden
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          style={progressStyle}
        >
          <div className={cn("h-full w-full rounded-full", progressCls)} />
        </div>
      )}
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const DEFAULT_DURATION = 4200;
const MAX_TOASTS = 5;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string, opts: ToastOptions = {}) => {
      const id = ++idRef.current;
      const duration = opts.duration ?? DEFAULT_DURATION;

      const item: ToastItem = {
        id,
        variant,
        message,
        description: opts.description,
        duration,
        action: opts.action,
      };

      setToasts((cur) => {
        const next = [...cur, item];
        // Cap at MAX_TOASTS — remove oldest
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
    },
    [dismiss],
  );

  // Clear timers on unmount
  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const api: ToastApi = {
    success: (msg, opts) => push("success", msg, opts),
    error: (msg, opts) => push("error", msg, opts),
    info: (msg, opts) => push("info", msg, opts),
    warning: (msg, opts) => push("warning", msg, opts),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast host — bottom-right on desktop, full-width bottom on mobile */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className={cn(
          "no-print fixed z-[9990]",
          "bottom-4 right-4 flex flex-col-reverse gap-2",
          "w-[calc(100vw-2rem)] sm:w-[360px]",
        )}
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
