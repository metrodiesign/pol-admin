import type { ApiClientStatus } from "@/types/control/api-client";
import type { Tone } from "@/lib/control/status";

export function maskSecret(raw: string): string {
  if (!raw) return "—";
  if (raw.length <= 10) return "••••••••";
  return `${raw.slice(0, 6)}••••••••${raw.slice(-4)}`;
}

export const STATUS_LABEL: Record<ApiClientStatus, string> = {
  active: "ใช้งาน",
  revoked: "เพิกถอนแล้ว",
};

export function statusTone(status: ApiClientStatus): Tone {
  switch (status) {
    case "active":
      return "ok";
    case "revoked":
      return "muted";
  }
}

/** Human-readable labels for OAuth2 scopes the platform grants to machine clients. */
export const SCOPE_LABEL: Record<string, string> = {
  "payments:create": "สร้างการชำระเงิน",
  "payments:read": "อ่านการชำระเงิน",
  "refunds:create": "สร้างการคืนเงิน",
  "refunds:read": "อ่านการคืนเงิน",
  "webhooks:read": "อ่าน webhook",
  "settlements:read": "อ่านการกระทบยอด",
};

export function scopeLabel(scope: string): string {
  return SCOPE_LABEL[scope] ?? scope;
}
