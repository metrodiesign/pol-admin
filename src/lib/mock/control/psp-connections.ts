import type { PspConnection } from "@/types/control/psp-connection";

// Deterministic seed — ไม่มี plaintext secret เหลือ (REQ-5.1). maskedSecrets เป็น hint
// ที่ backend คืนมาแล้ว (pre-masked) — ไม่ใช่ raw secret ที่ต้อง mask ฝั่ง client อีกที.
export const PSP_CONNECTIONS: PspConnection[] = [
  {
    pspConnectionId: "PSP-VPRV-OMISE",
    psp: "omise",
    merchantId: "vprivilege",
    enabledMethods: ["card", "promptpay"],
    config: { captureMode: "automatic", statementDescriptor: "VPRIVILEGE" },
    maskedSecrets: {
      secret: "skey_l••••••••f1602d",
      webhookSigningSecret: "whsec_l••••••••1602d9e4",
    },
    health: "healthy",
    lastWebhookAt: "2026-06-24T13:58:11",
  },
  {
    pspConnectionId: "PSP-VPRV-2C2P",
    psp: "2c2p",
    merchantId: "vprivilege",
    enabledMethods: ["installment"],
    config: { captureMode: "automatic", statementDescriptor: "VPRIVILEGE" },
    maskedSecrets: {
      secret: "2c2p_l••••••••02d9e4",
      webhookSigningSecret: "2c2p_w••••••••02d9e4",
    },
    health: "degraded",
    lastWebhookAt: "2026-06-24T09:41:55",
  },
  {
    pspConnectionId: "PSP-VCOM-OMISE",
    psp: "omise",
    merchantId: "vcommerce",
    enabledMethods: ["card"],
    config: { captureMode: "automatic", statementDescriptor: "VCOMMERCE" },
    maskedSecrets: {
      secret: "skey_l••••••••d5b9c3",
      webhookSigningSecret: "whsec_l••••••••b9c3f0",
    },
    health: "healthy",
    lastWebhookAt: "2026-06-24T13:12:47",
  },
  {
    pspConnectionId: "PSP-VSVN-2C2P",
    psp: "2c2p",
    merchantId: "vsouvenir",
    enabledMethods: ["installment", "promptpay"],
    config: { captureMode: "automatic", statementDescriptor: "VSOUVENIR" },
    maskedSecrets: {
      secret: "2c2p_l••••••••a2c9d4",
      webhookSigningSecret: "2c2p_w••••••••a2c9d4",
    },
    health: "offline",
    lastWebhookAt: "",
  },
];
