import type {
  SettlementBatch,
  SettlementPsp,
  SettlementMatchStatus,
} from "@/types/settlement";
import type { Tone } from "@/lib/control/status";

export const PSP_LABEL: Record<SettlementPsp, string> = {
  omise: "Omise",
  "2c2p": "2C2P",
};

export const STATUS_LABEL: Record<SettlementMatchStatus, string> = {
  matched: "กระทบยอดตรง",
  variance: "ยอดไม่ตรง",
  unreconciled: "ยังไม่กระทบยอด",
};

export function statusTone(status: SettlementMatchStatus): Tone {
  switch (status) {
    case "matched":
      return "ok";
    case "variance":
      return "warn";
    case "unreconciled":
      return "muted";
  }
}

/**
 * Match a settlement window: reported vs expected. Equal within a 0.01 (one
 * satang) tolerance counts as matched, so floating-point rounding never shows a
 * phantom variance. Pure + tested. "unreconciled" is not produced here — it is a
 * data state (no PSP report yet), assigned upstream.
 */
export function matchSettlement(
  expected: number,
  reported: number,
): "matched" | "variance" {
  return Math.abs(expected - reported) < 0.01 ? "matched" : "variance";
}

/** Signed difference reported − expected (positive = PSP reported more). */
export function variance(b: SettlementBatch): number {
  return b.reported - b.expected;
}
