import type { OriginatorType, OriginatorStatus } from "@/types/originator";
import type { Tone } from "@/lib/control/status";

export const TYPE_LABEL: Record<OriginatorType, string> = {
  branch: "สาขา",
  app: "แอปเชื่อมต่อ",
  agent: "ตัวแทน",
};

export const STATUS_LABEL: Record<OriginatorStatus, string> = {
  active: "ใช้งาน",
  disabled: "ปิดใช้งาน",
};

export function statusTone(status: OriginatorStatus): Tone {
  switch (status) {
    case "active":
      return "ok";
    case "disabled":
      return "muted";
  }
}
