import type { TenantId } from "@/types/tenant";

export type RoutingChannel = "card" | "promptpay" | "installment" | "any";
export type RoutingPsp = "omise" | "2c2p";

/**
 * One ordered routing rule: maps a payment context (tenant + channel + amount
 * band) to a target PSP, with an optional fallback. Rules are evaluated by
 * ascending `priority` — the lowest number wins. Changing routing is sensitive
 * and must go through maker-checker approval; the UI mutates a local copy only.
 */
export interface RoutingRule {
  id: string; // "RR-VCTL-CARD-01"
  priority: number; // lower = higher precedence
  tenantId: TenantId;
  channel: RoutingChannel;
  minAmount?: number; // THB, inclusive; omitted = no lower bound
  maxAmount?: number; // THB, inclusive; omitted = no upper bound
  targetPsp: RoutingPsp;
  fallbackPsp?: RoutingPsp;
  enabled: boolean;
}
