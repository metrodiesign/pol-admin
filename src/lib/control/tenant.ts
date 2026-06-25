import type { TenantStatus } from "@/types/tenant";
import type { Tone } from "@/lib/control/status";

export const TENANT_STATUS_LABEL: Record<TenantStatus, string> = {
  active: "ใช้งาน",
  onboarding: "กำลังเริ่มต้น",
  suspended: "ระงับ",
};

export function tenantStatusTone(status: TenantStatus): Tone {
  switch (status) {
    case "active":
      return "ok";
    case "onboarding":
      return "warn";
    case "suspended":
      return "error";
  }
}
