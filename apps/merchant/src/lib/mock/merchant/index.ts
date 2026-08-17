import type { Merchant, MerchantCode } from "@/types/merchant";

export const MERCHANTS: Merchant[] = [
  {
    id: "8f1c2e4a-6b3d-4c9f-9a1e-2d5b7c8e4f10",
    code: "vprivilege",
    displayName: "vPrivilege",
    legalEntityId: "0105566089871",
    status: "Active",
    country: "TH",
    currency: "THB",
    enabledChannels: "card,promptpay",
    createdAt: "2025-02-10T00:00:00.000Z",
    name: "vPrivilege",
    saqScope: "SAQ A — redirect-only",
    adminCount: 8,
    enabledPsps: ["omise", "2c2p"],
  },
  {
    id: "3a7d5f21-9c4b-4e8a-8f2c-6b1d3e9a5c72",
    code: "vcommerce",
    displayName: "vCommerce",
    legalEntityId: "0105561045213",
    status: "Active",
    country: "TH",
    currency: "THB",
    enabledChannels: "card",
    createdAt: "2024-11-05T00:00:00.000Z",
    name: "vCommerce",
    saqScope: "SAQ A — redirect-only",
    adminCount: 5,
    enabledPsps: ["omise"],
  },
  {
    id: "c19e4b6a-2f7d-4a1c-b3e8-9d0f6a2c4e85",
    code: "vsouvenir",
    displayName: "vSouvenir",
    legalEntityId: "0105558032649",
    status: "Active",
    country: "TH",
    currency: "THB",
    enabledChannels: "card,promptpay,installment",
    createdAt: "2025-05-20T00:00:00.000Z",
    name: "vSouvenir",
    saqScope: "SAQ A — redirect-only",
    adminCount: 3,
    enabledPsps: ["2c2p"],
  },
];

export const MERCHANT_LABEL: Record<MerchantCode, string> = {
  vprivilege: "vPrivilege",
  vcommerce: "vCommerce",
  vsouvenir: "vSouvenir",
};

export function merchantByCode(code: MerchantCode): Merchant | undefined {
  return MERCHANTS.find((m) => m.code === code);
}
