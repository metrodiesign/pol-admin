export type ApiClientStatus = "active" | "paused" | "revoked";
export type ApiClientType = "app" | "service";
export type GrantType = "client_credentials" | "authorization_code";

export interface ApiClient {
  id: string;
  name: string;
  type: ApiClientType;
  grants: GrantType[];
  scopes: string[];
  lastUsed: string;
  createdAt: string;
  status: ApiClientStatus;
  ipAllowlist: string[];
  reqs24h: number;
  env?: "sandbox" | "production";
}
