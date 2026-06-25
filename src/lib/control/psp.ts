import type {
  PspConnection,
  PspProvider,
  PspEnvironment,
  PspHealth,
} from "@/types/psp-connection";
import type { Tone } from "@/lib/control/status";

export const PROVIDER_LABEL: Record<PspProvider, string> = {
  omise: "Omise",
  "2c2p": "2C2P",
};

export const ENV_LABEL: Record<PspEnvironment, string> = {
  test: "Test",
  live: "Live",
};

export const HEALTH_LABEL: Record<PspHealth, string> = {
  healthy: "เชื่อมต่อปกติ",
  degraded: "ประสิทธิภาพลดลง",
  error: "เชื่อมต่อล้มเหลว",
  disabled: "ปิดใช้งาน",
};

export function healthTone(health: PspHealth): Tone {
  switch (health) {
    case "healthy":
      return "ok";
    case "degraded":
      return "warn";
    case "error":
      return "error";
    case "disabled":
      return "muted";
  }
}

/**
 * Mask a vault secret for display: keep a short prefix + suffix, hide the middle.
 * The raw secret must never reach the DOM — this is the only sanctioned render
 * path for credential material. Pure + tested.
 */
export function maskSecret(raw: string): string {
  if (!raw) return "—";
  if (raw.length <= 10) return "••••••••";
  return `${raw.slice(0, 6)}••••••••${raw.slice(-4)}`;
}

export function pspById(
  list: PspConnection[],
  id: string | undefined,
): PspConnection | undefined {
  if (!id) return undefined;
  return list.find((p) => p.id === id);
}
