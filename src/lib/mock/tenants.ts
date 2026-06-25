import type { Tenant, TenantId } from "@/types/tenant";

export const TENANTS: Tenant[] = [
  {
    id: "vcentral",
    code: "VCTL",
    name: "vCentral",
    legalEntity: "บริษัท วีเซ็นทรัล จำกัด",
    saqScope: "SAQ A — redirect-only",
    enabledPsps: ["omise", "2c2p"],
    adminCount: 8,
    status: "active",
  },
  {
    id: "vcommerce",
    code: "VCOM",
    name: "vCommerce",
    legalEntity: "บริษัท วีคอมเมิร์ซ จำกัด",
    saqScope: "SAQ A — redirect-only",
    enabledPsps: ["omise"],
    adminCount: 5,
    status: "active",
  },
  {
    id: "vsouvenir",
    code: "VSVN",
    name: "vSouvenir",
    legalEntity: "บริษัท วีซูเวอเนียร์ จำกัด",
    saqScope: "SAQ A — redirect-only",
    enabledPsps: ["2c2p"],
    adminCount: 3,
    status: "onboarding",
  },
];

export const TENANT_LABEL: Record<TenantId, string> = {
  vcentral: "vCentral",
  vcommerce: "vCommerce",
  vsouvenir: "vSouvenir",
};

export function tenantById(id: TenantId): Tenant | undefined {
  return TENANTS.find((t) => t.id === id);
}
