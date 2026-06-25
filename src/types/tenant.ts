// Affiliated companies that accept payments through the platform. Each is a
// separate legal entity with its own PCI SAQ A scope — the platform orchestrates,
// money settles PSP → company directly. Tenant isolation (RLS) is enforced at the
// backend; control screens scope their data by tenantId.

export type TenantId = "vcentral" | "vcommerce" | "vsouvenir";

export type TenantStatus = "active" | "onboarding" | "suspended";

export interface Tenant {
  id: TenantId;
  code: string; // "VCTL", "VCOM", "VSVN"
  name: string;
  legalEntity: string;
  saqScope: string; // PCI SAQ A scope label
  enabledPsps: string[]; // e.g. ["omise", "2c2p"]
  adminCount: number;
  status: TenantStatus;
}
