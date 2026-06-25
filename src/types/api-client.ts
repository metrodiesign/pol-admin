import type { TenantId } from "@/types/tenant";

export type ApiClientStatus = "active" | "revoked";

/**
 * An OAuth2 machine (client-credentials) client that calls the platform API.
 * The client secret lives in a vault — it is shown in full exactly once at
 * creation time, then only ever rendered masked via maskSecret(). Scopes gate
 * which API operations the client may perform.
 */
export interface ApiClient {
  id: string; // "ACL-VCTL-01"
  clientId: string; // cli_live_... (safe to display)
  name: string;
  tenantId: TenantId;
  scopes: string[]; // e.g. ["payments:create", "payments:read"]
  clientSecret: string; // fake vault secret — NEVER rendered raw; always via maskSecret()
  lastUsedAt: string; // ISO datetime, or "" if never used
  createdAt: string; // ISO date
  status: ApiClientStatus;
}
