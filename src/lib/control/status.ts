// Shared status tone system for the control plane. Every control screen maps its
// domain status onto one of these tones so badges/spines stay consistent across
// PSP, webhooks, approvals, audit, settlements, etc. Token families follow the
// existing Minimals palette (see src/lib/transaction.ts STATUS_STYLE).

export type Tone = "ok" | "warn" | "error" | "info" | "muted";

/** Pill background + text — for the status badge. */
export const TONE_STYLE: Record<Tone, string> = {
  ok: "bg-success/16 text-success-dark",
  warn: "bg-warning/16 text-warning-dark",
  error: "bg-error/16 text-error-dark",
  info: "bg-info/16 text-info-dark",
  muted: "bg-grey-500/16 text-grey-600",
};
