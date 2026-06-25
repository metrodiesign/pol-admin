import type { TenantId } from "@/types/tenant";

export type PspProvider = "omise" | "2c2p";
export type PspEnvironment = "test" | "live";
export type PspHealth = "healthy" | "degraded" | "error" | "disabled";

/**
 * A configured PSP connector for one tenant + environment. Credentials live in a
 * vault — only public keys and masked secrets are ever exposed to the UI. Payments
 * are always redirect-only (PCI SAQ A), so `redirectOnly` is structurally true.
 */
export interface PspConnection {
  id: string; // "PSP-VCTL-OMISE-LIVE"
  tenantId: TenantId;
  provider: PspProvider;
  environment: PspEnvironment;
  publicKey: string; // pkey_live_... (safe to display)
  secretKey: string; // fake vault secret — NEVER rendered raw; always via maskSecret()
  webhookSecret: string; // fake — masked at the boundary
  redirectOnly: true;
  health: PspHealth;
  lastWebhookAt: string; // ISO datetime, or "" if none yet
  createdAt: string; // ISO date
}
