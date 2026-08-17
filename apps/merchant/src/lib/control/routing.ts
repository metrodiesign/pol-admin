import type {
  RoutingRule,
  RoutingChannel,
  RoutingPsp,
} from "@/types/control/routing-rule";
import type { MerchantCode } from "@/types/merchant";
import type { Tone } from "@/lib/control/status";

export const CHANNEL_LABEL: Record<RoutingChannel, string> = {
  card: "บัตรเครดิต/เดบิต",
  promptpay: "พร้อมเพย์",
  installment: "ผ่อนชำระ",
  any: "ทุกช่องทาง",
};

export const PSP_LABEL: Record<RoutingPsp, string> = {
  omise: "Omise",
  "2c2p": "2C2P",
};

export function enabledTone(enabled: boolean): Tone {
  return enabled ? "ok" : "muted";
}

/**
 * Resolve a payment context to a target PSP (+ optional fallback). Considers only
 * enabled rules for the same tenant whose channel is "any" or matches, and whose
 * amount falls within [minAmount ?? 0, maxAmount ?? ∞]. The lowest priority number
 * wins (highest precedence). Returns null when nothing matches. Pure + tested.
 */
export function evaluateRouting(
  rules: RoutingRule[],
  ctx: { channel: RoutingChannel; amount: number; merchantId: MerchantCode },
): { targetPsp: RoutingPsp; fallbackPsp?: RoutingPsp } | null {
  const match = rules
    .filter((r) => r.enabled)
    .filter((r) => r.merchantId === ctx.merchantId)
    .filter((r) => r.channel === "any" || r.channel === ctx.channel)
    .filter(
      (r) =>
        ctx.amount >= (r.minAmount ?? 0) &&
        ctx.amount <= (r.maxAmount ?? Infinity),
    )
    .sort((a, b) => a.priority - b.priority)[0];

  if (!match) return null;
  return { targetPsp: match.targetPsp, fallbackPsp: match.fallbackPsp };
}
