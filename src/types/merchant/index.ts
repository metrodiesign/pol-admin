// Affiliated companies that accept payments through the platform. Each is a
// separate legal entity with its own PCI SAQ A scope — the platform orchestrates,
// money settles PSP → company directly. Merchant isolation (RLS) is enforced at
// the backend; control screens scope their data by merchantId (holds the `code`
// allowlist value, not the GUID `id` — see src/lib/mock/merchants.ts).

export type MerchantCode = "vprivilege" | "vcommerce" | "vsouvenir";

export type MerchantStatus = "Active";

export interface Merchant {
  id: string; // GUID จาก MerchantView.Id — deterministic literal, ไม่ผูก allowlist (REQ-9.4a)
  code: MerchantCode;
  displayName: string;
  legalEntityId: string;
  status: MerchantStatus;
  country: string;
  currency: string;
  enabledChannels: string; // CSV ตาม MerchantView.EnabledChannels — ห้ามเปลี่ยนเป็น array
  createdAt: string; // ISO
  // UI-only, ไม่มีใน MerchantView (REQ-3.7):
  name: string; // ใช้แสดงในตาราง/detail แยกจาก displayName (consumer จริงใน control-plane list/detail component เดิม)
  saqScope: string; // PCI SAQ A scope label
  adminCount: number;
  enabledPsps: string[];
}
