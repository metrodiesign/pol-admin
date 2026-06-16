import type { ApiClient } from "@/types/api-client";

export const API_CLIENTS: ApiClient[] = [
  { id: "cli_iPOL_8821", name: "iPolicy Mobile", type: "app", grants: ["client_credentials", "authorization_code"], scopes: ["payment.create", "payment.read", "policy.read"], lastUsed: "12 นาทีที่แล้ว", createdAt: "2024-03-12", status: "active", ipAllowlist: ["203.150.224.0/20"], reqs24h: 12480 },
  { id: "cli_RNWL_4412", name: "Renewal Portal", type: "app", grants: ["client_credentials"], scopes: ["payment.create", "policy.read"], lastUsed: "38 นาทีที่แล้ว", createdAt: "2024-05-08", status: "active", ipAllowlist: [], reqs24h: 8842 },
  { id: "cli_BRK_GOLD", name: "SenetLink Broker API", type: "service", grants: ["client_credentials"], scopes: ["payment.create", "payment.read"], lastUsed: "2 ชั่วโมงที่แล้ว", createdAt: "2024-08-30", status: "active", ipAllowlist: ["54.255.10.0/24"], reqs24h: 1842 },
  { id: "cli_LEG_2018", name: "Legacy Sync Job", type: "service", grants: ["client_credentials"], scopes: ["payment.read", "policy.read"], lastUsed: "4 วันที่แล้ว", createdAt: "2023-02-10", status: "paused", ipAllowlist: ["172.16.0.0/16"], reqs24h: 0 },
  { id: "cli_DEV_TEST", name: "Dev Sandbox", type: "app", grants: ["authorization_code"], scopes: ["payment.create", "payment.read", "policy.read"], lastUsed: "1 ชั่วโมงที่แล้ว", createdAt: "2025-04-22", status: "active", ipAllowlist: [], reqs24h: 124, env: "sandbox" },
  { id: "cli_OLD_2017", name: "Decommissioned Connector", type: "service", grants: ["client_credentials"], scopes: ["payment.read"], lastUsed: "90 วันที่แล้ว", createdAt: "2022-08-19", status: "revoked", ipAllowlist: [], reqs24h: 0 },
];
