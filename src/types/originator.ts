import type { TenantId } from "@/types/tenant";

export type OriginatorType = "branch" | "app" | "agent";
export type OriginatorStatus = "active" | "disabled";

/**
 * A payment SOURCE that initiates payment requests — a branch, a connected app,
 * or an agent. This is the technical source identity, distinct from a KYC'd
 * producer. App-type originators authenticate via an API client; branch/agent
 * sources may have none.
 */
export interface Originator {
  id: string;
  code: string;
  name: string;
  type: OriginatorType;
  tenantId: TenantId;
  linkedApiClientId?: string; // cli_live_... — present for app-type sources
  status: OriginatorStatus;
}
